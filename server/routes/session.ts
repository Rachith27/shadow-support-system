import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/session/create
router.post('/create', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const { data, error } = await supabaseServer
      .from('sessions')
      .insert({ session_id: sessionId })
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
