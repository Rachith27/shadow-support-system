import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { generateSessionInsight } from '../services/ai_insight';

const router = Router();

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/session/create
router.post('/create', async (req, res) => {
  try {
    const { sessionId, userName, ageGroup, phone, userId, chatType } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const title = chatType === 'safe' ? `Session ${new Date().toLocaleDateString()}` : undefined;

    const { data, error } = await supabaseServer
      .from('sessions')
      .insert({ 
        session_id: sessionId,
        user_name: userName || null, 
        age_group: ageGroup || null, 
        age_group_segment: ageGroup || null, 
        phone: phone || null,
        user_id: userId || null,
        chat_type: chatType || 'anonymous',
        title: title
      })
      .select()
      .single();

    if (error) {
      console.error('Session create error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ session: data });
  } catch (err) {
    console.error('Session endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/session/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabaseServer
      .from('sessions')
      .select('id, session_id, chat_type, title, created_at')
      .eq('user_id', userId)
      .eq('chat_type', 'safe')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ sessions: data });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/session/:id/end
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the full session history
    const { data: session, error: fetchError } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('session_id', id)
      .single();

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Generate AI Insights
    const insight = await generateSessionInsight(session.messages || [], session.age_group);

    // 3. Update the session with insights and mark as completed
    const { error: updateError } = await supabaseServer
      .from('sessions')
      .update({
        is_completed: true,
        ai_summary: insight.summary,
        topic_category: insight.topicCategory,
        // We can also update general analysis if needed
        analysis: {
           ...session.analysis,
           riskLevel: insight.riskLevel,
           mainTopic: insight.topicCategory
        },
        last_active: new Date().toISOString()
      })
      .eq('session_id', id);

    if (updateError) {
      console.error('Session end update error:', updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ success: true, insight });
  } catch (err) {
    console.error('Session end error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/session/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseServer
      .from('sessions')
      .select('*')
      .eq('session_id', id)
      .maybeSingle();

    if (error) {
      console.error('Session fetch error:', error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ session: data });
  } catch (err) {
    console.error('Session fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
