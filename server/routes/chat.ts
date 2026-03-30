import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '../../lib/supabase';
import { getChatResponse, analyzeWellbeing } from '../services/gemini';

const router = Router();

// POST /api/session/start
router.post('/session/start', async (req, res) => {
  try {
    const sessionId = uuidv4();
    const { ageGroup } = req.body || {};

    const { error } = await supabaseAdmin
      .from('sessions')
      .insert({ session_id: sessionId, age_group: ageGroup, messages: [] });

    if (error) {
        console.error("Supabase Session Error:", error);
        return res.status(500).json({ error: 'Failed to start session.' });
    }

    res.json({ sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Fatal error starting session.' });
  }
});

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { sessionId, content, message } = req.body;
    const userText = content || message;

    if (!userText) {
      return res.status(400).json({ error: "Missing 'content' or 'message' field" });
    }

    // 1. Fetch Session History
    const { data: session, error: fetchError } = await supabaseAdmin
      .from('sessions')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (fetchError || !session) {
        return res.status(404).json({ error: 'Session not found' });
    }

    const messages = session.messages || [];
    messages.push({ role: 'user', content: userText, timestamp: new Date().toISOString() });

    // 2. Risk Assessment (Original Logic)
    const textLower = userText.toLowerCase();
    const HIGH_RISK = ['kill myself', 'want to die', 'end my life', 'suicide', 'self harm'];
    const MEDIUM_RISK = ['give up', 'worthless', 'nobody cares', 'hopeless'];
    
    const isHigh = HIGH_RISK.some(term => textLower.includes(term));
    const isMed = MEDIUM_RISK.some(term => textLower.includes(term));
    
    let replyContent = "";
    let riskLevel = 'low';

    if (isHigh) {
      replyContent = "I hear how much pain you're in right now. You are not alone. Please talk to someone who can help immediately at local helpline 988.";
      riskLevel = 'high';
    } else if (isMed) {
      replyContent = "It sounds like you're carrying a very heavy burden right now. Your presence absolutely matters. Could you tell me a bit more about what brought you here?";
      riskLevel = 'medium';
    } else {
      // Call Gemini for general chat
      replyContent = await getChatResponse(messages);
    }

    // 3. AI Wellbeing Analysis
    let analysis = session.analysis;
    let targetIssue = session.target_issue;

    try {
        const result = await analyzeWellbeing(userText);
        analysis = result;
        targetIssue = result.supportNeed;
    } catch (aiErr) {
        console.error("AI Wellbeing Generation Failed:", aiErr);
        analysis = analysis || { emotion: "unknown", situation: "unknown", riskLevel };
    }

    // 4. Save AI Reply and Analysis
    messages.push({ role: 'ai', content: replyContent, timestamp: new Date().toISOString() });
    
    const { error: updateError } = await supabaseAdmin
      .from('sessions')
      .update({ 
          messages, 
          analysis, 
          target_issue: targetIssue 
      })
      .eq('session_id', sessionId);

    if (updateError) {
        console.error("Supabase Save Error:", updateError);
    }

    // 5. If High Risk, create a Flagged Case
    if (riskLevel === 'high') {
        await supabaseAdmin.from('flagged_cases').insert({
            age_group: session.age_group,
            risk_level: 'high',
            detected_concern: "Self-Harm/Suicidal Ideation detected in chat.",
            ai_summary: `Student expressed high-risk sentiment: "${userText}"`,
            intervention_status: 'pending'
        });
    }

    res.json({ reply: replyContent, riskLevel });

  } catch (err) {
    console.error("Chat Route Error:", err);
    res.status(500).json({ error: 'Fatal Chat Server Error' });
  }
});

// GET /api/session/:id/summary
router.get('/session/:id/summary', async (req, res) => {
  try {
    const { data: session, error } = await supabaseAdmin
      .from('sessions')
      .select('analysis, target_issue')
      .eq('session_id', req.params.id)
      .single();

    if (error || !session) return res.status(404).json({ error: 'Session not found' });
    
    res.json({ 
        summary: session.analysis || { emotion: "unknown", situation: "Data missing" }, 
        targetIssue: session.target_issue || 'general_support',
        disclaimer: "This is an AI generated observation, not a clinical diagnosis."
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching session' });
  }
});

export default router;
