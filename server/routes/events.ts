import { Router } from 'express';
import { prisma } from '../../lib/prisma';

const router = Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
        orderBy: { date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error("Prisma Events Error:", error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// POST /api/events/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const { sessionId, contactProvided, contactInfo } = req.body;
    const eventId = req.params.id;

    if (!sessionId) return res.status(400).json({ error: "Session identification required." });

    // 1. Check if event exists
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, interested_count: true }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    // 2. Create registration record
    try {
        await prisma.eventRegistration.create({
            data: {
                event_id: eventId,
                session_id: sessionId,
                contact_provided: contactProvided || false,
                contact_info: contactInfo || '',
                status: 'registered'
            }
        });
    } catch (regError) {
        console.error("Prisma Registration Error:", regError);
        return res.status(500).json({ error: 'Registration failed.' });
    }

    // 3. Increment interested count
    await prisma.event.update({
        where: { id: eventId },
        data: { interested_count: { increment: 1 } }
    });

    res.json({ success: true, message: "Successfully registered for the event." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

export default router;
