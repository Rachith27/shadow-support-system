import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabase';

const router = Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
        console.error("Supabase Events Error:", error);
        return res.status(500).json({ error: 'Failed to fetch events' });
    }

    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Error processing events' });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const { sessionId, contactProvided, contactInfo } = req.body;
    const eventId = req.params.id;

    if (!sessionId) return res.status(400).json({ error: "Session identification required." });

    // 1. Check if event exists
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, interested_count')
      .eq('id', eventId)
      .single();

    if (eventError || !event) return res.status(404).json({ error: "Event not found" });

    // 2. Create registration record
    const { error: regError } = await supabaseAdmin
      .from('event_registrations')
      .insert({
          event_id: eventId,
          session_id: sessionId,
          contact_provided: contactProvided || false,
          contact_info: contactInfo || '',
          status: 'registered'
      });

    if (regError) {
        console.error("Supabase Registration Error:", regError);
        return res.status(500).json({ error: 'Registration failed.' });
    }

    // 3. Increment interested count
    await supabaseAdmin
        .from('events')
        .update({ interested_count: (event.interested_count || 0) + 1 })
        .eq('id', eventId);

    res.json({ success: true, message: "Successfully registered for the event." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

export default router;
