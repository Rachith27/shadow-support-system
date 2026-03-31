import { Server, Socket } from 'socket.io';
import { createClient } from '@supabase/supabase-js';
import type { MoodCheckInPayload, UserMessagePayload, VentPayload } from '../../types';

// Server-side Supabase client — bypasses RLS
let supabaseServer: any;

const getSupabaseServer = () => {
  if (!supabaseServer) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase environment variables are missing!');
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
    socket.join(payload.sessionId);
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

      await supabase.from('sessions').update({ 
        risk_score: riskScore, 
        risk_tier: riskTier,
        last_active: new Date().toISOString()
      }).eq('session_id', payload.sessionId);

      await supabase.from('session_events').insert({ 
        session_id: payload.sessionId, 
        event_type: 'mood_checkin', 
        sentiment_score: blendedScore, 
        mood_emoji: payload.emojiIndex, 
        slider_value: payload.sliderValue 
      });

      if (riskTier === 'high') {
         const { data: sessionInfo } = await supabase.from('sessions').select('age_group, user_name, phone').eq('session_id', payload.sessionId).maybeSingle();
         await supabase.from('flagged_cases').insert({
            session_id: payload.sessionId,
            age_group: sessionInfo?.age_group || 'Unknown',
            risk_level: 'high',
            detected_concern: `Live Session Help Request: ${sessionInfo?.user_name || 'Anonymous User'}`,
            ai_summary: `Student ${sessionInfo?.user_name || payload.sessionId.slice(0, 8)} has flagged as High Risk.`,
            guidance: { 
              approach: "Join via Safe Chat. Chat first protocol.", 
              whatToSay: ["I'm here to support you."], 
              dos: ["Chat first"], 
              donts: ["Call immediately"] 
            }
         });
      }
      socket.emit('risk_update', { riskTier, riskScore });
    } catch (err) { console.error('Mood checkin error:', err); }
  });

  // ── JOIN SESSION (Volunteers) ──────────────────────────────────
  socket.on('join_session', async (payload: { sessionId: string; volunteerName?: string }) => {
    socket.join(payload.sessionId);
    console.log(`🙋 Volunteer joined room: ${payload.sessionId}`);
    
    const supabase = getSupabaseServer();
    if (supabase) {
      await supabase.from('sessions').update({ is_human_moderated: true }).eq('session_id', payload.sessionId);
    }
    
    io.to(payload.sessionId).emit('volunteer_joined', { 
      volunteerName: payload.volunteerName || "SafeSpace Counselor" 
    });
  });

  // ── USER MESSAGE ───────────────────────────────────────────────
  socket.on('user_message', async (payload: UserMessagePayload) => {
    socket.join(payload.sessionId);
    try {
      const supabase = getSupabaseServer();
      if (!supabase) return;

      io.to(payload.sessionId).emit('user_message_broadcast', { 
        text: payload.text, 
        timestamp: Date.now() 
      });

      await supabase.from('session_events').insert({ session_id: payload.sessionId, event_type: 'message' });

      const { data: sessionData } = await supabase.from('sessions').select('messages, is_human_moderated').eq('session_id', payload.sessionId).single();
      const isModerated = sessionData?.is_human_moderated || false;
      const history = sessionData?.messages || [];
      const updatedHistory = [...history, { role: 'user', content: payload.text, timestamp: Date.now() }];

      await supabase.from('sessions').update({ 
        messages: updatedHistory, 
        last_active: new Date().toISOString() 
      }).eq('session_id', payload.sessionId);

      if (isModerated) {
          console.log(`🤖 AI silenced for session ${payload.sessionId}`);
          return;
      }

      socket.emit('typing_indicator', { active: true });

      try {
        const apiKey = process.env.GROK_AI_API || process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error('Missing API Key');

        const groqMessages = [
          { role: 'system', content: 'You are a supportive listener. Keep it under 3 sentences.' },
          ...updatedHistory.slice(-10).map((m: any) => ({ role: m.role, content: m.content }))
        ];

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: groqMessages, temperature: 0.7 })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "I hear you.";
        const finalHistory = [...updatedHistory, { role: 'assistant', content: reply.trim(), timestamp: Date.now() }];
        
        await supabase.from('sessions').update({ messages: finalHistory }).eq('session_id', payload.sessionId);

        socket.emit('typing_indicator', { active: false });
        io.to(payload.sessionId).emit('system_message', { text: reply.trim() });
      } catch (aiError) {
        socket.emit('typing_indicator', { active: false });
        socket.emit('system_message', { text: "I hear you." });
      }
    } catch (err) { console.error('User message error:', err); }
  });

  // ── VOLUNTEER MESSAGE ──────────────────────────────────────────
  socket.on('volunteer_message', async (payload: { sessionId: string; text: string; volunteerName?: string }) => {
    try {
      const supabase = getSupabaseServer();
      if (!supabase) return;

      const { data: sessionData } = await supabase.from('sessions').select('messages').eq('session_id', payload.sessionId).single();
      const history = sessionData?.messages || [];
      const newMsg = { role: 'volunteer', content: payload.text, volunteerName: payload.volunteerName, timestamp: Date.now() };
      
      await supabase.from('sessions').update({ 
        messages: [...history, newMsg],
        last_active: new Date().toISOString(),
        is_human_moderated: true 
      }).eq('session_id', payload.sessionId);

      io.to(payload.sessionId).emit('volunteer_message_broadcast', {
        text: payload.text,
        volunteerName: payload.volunteerName || "Counselor",
        timestamp: Date.now()
      });
    } catch (err) { console.error('Volunteer message error:', err); }
  });

  // ── EXERCISE COMPLETE ──────────────────────────────────────────
  socket.on('exercise_complete', async (payload: { sessionId: string; exerciseType: string; moodScore: number; timestamp: number }) => {
    try {
      const supabase = getSupabaseServer();
      if (!supabase) return;

      const { data: sessionData } = await supabase.from('sessions').select('exercise_completions, risk_score').eq('session_id', payload.sessionId).single();
      const completions = sessionData?.exercise_completions || [];
      const updatedCompletions = [...completions, { type: payload.exerciseType, mood: payload.moodScore, timestamp: payload.timestamp }];

      // Potentially lower risk if mood is high (4-5)
      let newRiskScore = sessionData?.risk_score || 0;
      if (payload.moodScore >= 4) newRiskScore = Math.max(0, newRiskScore - 0.1);
      
      let newRiskTier: 'low' | 'medium' | 'high' = 'low';
      if (newRiskScore >= 0.6) newRiskTier = 'high';
      else if (newRiskScore >= 0.3) newRiskTier = 'medium';

      await supabase.from('sessions').update({ 
        exercise_completions: updatedCompletions,
        risk_score: newRiskScore,
        risk_tier: newRiskTier,
        last_active: new Date().toISOString()
      }).eq('session_id', payload.sessionId);

      await supabase.from('session_events').insert({ 
        session_id: payload.sessionId, 
        event_type: 'exercise_complete',
        sentiment_score: payload.moodScore / 5 // Normalized 0-1
      });

      socket.emit('risk_update', { riskTier: newRiskTier, riskScore: newRiskScore });
      console.log(`🌿 Exercise ${payload.exerciseType} completed for ${payload.sessionId}`);
    } catch (err) { console.error('Exercise complete error:', err); }
  });

  // ── REQUEST REFRAME ─────────────────────────────────────────────
  socket.on('request_reframe', async (payload: { sessionId: string; thought: string }) => {
    try {
      const apiKey = process.env.GROK_AI_API || process.env.GROQ_API_KEY;
      if (!apiKey) return;

      const reframeMessages = [
        { role: 'system', content: 'You are a supportive counselor. Take the following distressing thought and provide one short, realistic cognitive reframe that is compassionate and balanced. Max 2 sentences.' },
        { role: 'user', content: payload.thought }
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model: 'llama-3.1-8b-instant', messages: reframeMessages, temperature: 0.5 })
      });

      const data = await response.json();
      const reframe = data.choices?.[0]?.message?.content || "I understand this is hard. Let's try to look at it one step at a time.";
      socket.emit('reframe_response', { text: reframe.trim() });
    } catch (err) { console.error('Reframe error:', err); }
  });

  // ── VENT MESSAGE ───────────────────────────────────────────────
  socket.on('vent_message', async (payload: VentPayload) => {
    socket.join(payload.sessionId);
    try {
      const supabase = getSupabaseServer();
      if (!supabase) return;
      await supabase.from('session_events').insert({ session_id: payload.sessionId, event_type: 'vent' });
      await supabase.from('sessions').update({ last_active: new Date().toISOString() }).eq('session_id', payload.sessionId);
    } catch (err) { console.error('Vent error:', err); }
  });
}
