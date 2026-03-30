import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import type { MoodCheckInPayload, UserMessagePayload, VentPayload } from '../../types';

// Server-side Supabase client — bypasses RLS
// We initialize this inside handlers to ensure process.env is loaded
let supabaseServer: any;

const getSupabaseServer = () => {
  if (!supabaseServer) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase environment variables are missing! Server features will not work.');
      return null;
    }
    supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return supabaseServer;
};

const EMOJI_SCORES = [1.0, 0.75, 0.5, 0.25, 0.0];

export function registerSocketHandlers(io: Server, socket: Socket) {

  // ── MOOD CHECK-IN ──────────────────────────────────────────────
  socket.on('mood_checkin', async (payload: MoodCheckInPayload) => {
    try {
      const sentimentScore = EMOJI_SCORES[payload.emojiIndex];
      let blendedScore = sentimentScore;

      if (payload.sliderValue !== null && payload.sliderValue !== undefined) {
        const sliderNormalized = payload.sliderValue / 10;
        blendedScore = (sentimentScore * 0.6) + (sliderNormalized * 0.4);
      }

      const riskScore = Math.round((1.0 - blendedScore) * 100) / 100;
      let riskTier: 'low' | 'medium' | 'high';

      if (riskScore < 0.3) riskTier = 'low';
      else if (riskScore < 0.6) riskTier = 'medium';
      else riskTier = 'high';

      const supabase = getSupabaseServer();
      if (!supabase) return;

      // Update session in Supabase
      await supabase
        .from('sessions')
        .update({
          risk_score: riskScore,
          risk_tier: riskTier,
          last_active: new Date().toISOString(),
        })
        .eq('session_id', payload.sessionId);

      // Insert event
      await supabase.from('session_events').insert({
        session_id: payload.sessionId,
        event_type: 'mood_checkin',
        sentiment_score: blendedScore,
        mood_emoji: payload.emojiIndex,
        slider_value: payload.sliderValue,
      });

      // Emit risk update back to client
      socket.emit('risk_update', { riskTier, riskScore });

      console.log(`📊 Mood check-in: session=${payload.sessionId.slice(0, 8)}... risk=${riskTier} (${riskScore})`);
    } catch (err) {
      console.error('Mood check-in error:', err);
    }
  });

  // ── USER MESSAGE ───────────────────────────────────────────────
  socket.on('user_message', async (payload: UserMessagePayload) => {
    try {
      const supabase = getSupabaseServer();
      if (!supabase) return;

      // 1. Log event in session_events (telemetry)
      await supabase.from('session_events').insert({
        session_id: payload.sessionId,
        event_type: 'message',
        sentiment_score: null,
        mood_emoji: null,
        slider_value: null,
      });

      // 2. Fetch current session history from 'sessions' table
      const { data: sessionData, error: sessionFetchError } = await supabase
        .from('sessions')
        .select('messages')
        .eq('session_id', payload.sessionId)
        .single();

      if (sessionFetchError) {
        console.error('Error fetching session history:', sessionFetchError);
      }

      const history = sessionData?.messages || [];
      const newUserMessage = { role: 'user', content: payload.text, timestamp: Date.now() };
      const updatedHistory = [...history, newUserMessage];

      // Update last_active
      await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('session_id', payload.sessionId);

      // Show typing indicator
      socket.emit('typing_indicator', { active: true });

      try {
        const apiKey = process.env.GROK_AI_API || process.env.GROQ_API_KEY;
        if (!apiKey) {
          throw new Error('Missing GROK_AI_API in .env.local');
        }

        // Dynamically fetch the latest mood from DB to adjust Tone
        const { data: moodData } = await supabase
          .from('session_events')
          .select('mood_emoji')
          .eq('session_id', payload.sessionId)
          .eq('event_type', 'mood_checkin')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let toneInstruction = "Be caring but neutral.";
        if (moodData && moodData.mood_emoji !== null) {
          switch (moodData.mood_emoji) {
            case 0:
              toneInstruction = "The user is feeling terrible/highly stressed. Be incredibly gentle, deeply empathetic, and consoling. Wrap them in a verbal hug.";
              break;
            case 1:
              toneInstruction = "The user is feeling down/anxious. Be highly supportive, validating, and caring.";
              break;
            case 2:
              toneInstruction = "The user is feeling okay. Be friendly, neutral, and helpful.";
              break;
            case 3:
              toneInstruction = "The user is feeling good. Be warm, upbeat, and encouraging.";
              break;
            case 4:
              toneInstruction = "The user is feeling great! Be energetic, highly enthusiastic, and match their joyful energy!";
              break;
          }
        }

        const systemPrompt = `You are a supportive, non-judgmental active listener on an anonymous youth mental health platform. 
        ${toneInstruction}
        Keep the conversation flowing smoothly. Acknowledge their previous messages if relevant, but stay focused on the current topic.
        Keep responses under 3 sentences. Never offer clinical advice or diagnoses. Just validate their feelings and make them feel heard.`;

        // Prepare messages for Groq (Limit history to last 10 messages + system prompt)
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...updatedHistory.slice(-10).map((m: any) => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: groqMessages,
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        const data = await response.json();
        
        if (data.error) {
           console.error('Groq API Error details:', data.error);
           throw new Error(data.error.message || 'Groq API error');
        }

        const reply = data.choices?.[0]?.message?.content || "I hear you, take your time.";
        const newAssistantMessage = { role: 'assistant', content: reply.trim(), timestamp: Date.now() };

        // Save conversation history back to Supabase
        const finalHistory = [...updatedHistory, newAssistantMessage];
        await supabase
          .from('sessions')
          .update({ messages: finalHistory })
          .eq('session_id', payload.sessionId);

        socket.emit('typing_indicator', { active: false });
        socket.emit('system_message', { text: reply.trim() });
      } catch (aiError) {
        console.error('Groq fetch error:', aiError);
        socket.emit('typing_indicator', { active: false });
        socket.emit('system_message', {
          text: "I hear you. (AI context limit reached or API offline).",
        });
      }

      console.log(`💬 Message from session=${payload.sessionId.slice(0, 8)}...`);
    } catch (err) {
      console.error('User message error:', err);
    }
  });

  // ── VENT MESSAGE ───────────────────────────────────────────────
  socket.on('vent_message', async (payload: VentPayload) => {
    try {
      // Log that a vent happened — no text content, no sentiment
      const supabase = getSupabaseServer();
      if (!supabase) return;
      await supabase.from('session_events').insert({
        session_id: payload.sessionId,
        event_type: 'vent',
      });

      // Update last_active
      await supabase
        .from('sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('session_id', payload.sessionId);

      // No response event — vent mode is one-way
      console.log(`🌊 Vent from session=${payload.sessionId.slice(0, 8)}...`);
    } catch (err) {
      console.error('Vent message error:', err);
    }
  });
}
