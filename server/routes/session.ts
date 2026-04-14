import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { generateSessionInsight } from '../services/ai_insight';

const router = Router();

// POST /api/session/create
router.post('/create', async (req, res) => {
  try {
    const { sessionId, userName, ageGroup, phone, userId, chatType } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const title = chatType === 'safe' ? `Session ${new Date().toLocaleDateString()}` : undefined;

    let data;
    try {
        data = await prisma.session.create({
            data: {
                session_id: sessionId,
                user_name: userName || null, 
                age_group: ageGroup || null, 
                age_group_segment: ageGroup || null, 
                phone: phone || null,
                user_id: userId || null,
                chat_type: chatType || 'anonymous',
                title: title
            }
        });
    } catch (error: unknown) {
      console.error('Session create error:', error);
      return res.status(500).json({ 
          error: error instanceof Error ? error.message : String(error) 
      });
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
    const data = await prisma.session.findMany({
        where: { user_id: userId, chat_type: 'safe' },
        select: { id: true, session_id: true, chat_type: true, title: true, created_at: true },
        orderBy: { created_at: 'desc' }
    });

    if (!data) return res.status(500).json({ error: 'Failed to fetch' });
    return res.json({ sessions: data });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/session/:id/end
router.post('/:id/end', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the full session history
    const session = await prisma.session.findUnique({
        where: { session_id: id }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // 2. Generate AI Insights
    const insight = await generateSessionInsight(Array.isArray(session.messages) ? (session.messages as Record<string, unknown>[]) : [], session.age_group || "");

    // 3. Update the session with insights and mark as completed
    try {
        await prisma.session.update({
            where: { session_id: id },
            data: {
                is_completed: true,
                ai_summary: insight.summary,
                topic_category: insight.topicCategory,
                analysis: {
                    ...(session.analysis as Record<string, unknown> || {}),
                    riskLevel: insight.riskLevel,
                    mainTopic: insight.topicCategory
                },
                last_active: new Date()
            }
        });
    } catch (updateError: unknown) {
        console.error('Session end update error:', updateError);
        return res.status(500).json({ 
            error: updateError instanceof Error ? updateError.message : String(updateError)
        });
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
    const data = await prisma.session.findUnique({
        where: { session_id: id }
    });

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
