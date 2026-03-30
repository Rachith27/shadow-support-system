import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/mood/submit
router.post('/submit', async (req, res) => {
  try {
    const { sessionId, emojiIndex, sliderValue } = req.body;

    if (!sessionId || emojiIndex === undefined) {
      return res.status(400).json({ error: 'sessionId and emojiIndex are required' });
    }

    const scores = [1.0, 0.75, 0.5, 0.25, 0.0];
    const sentimentScore = scores[emojiIndex];
    let blendedScore = sentimentScore;

    if (sliderValue !== null && sliderValue !== undefined) {
      const sliderNormalized = sliderValue / 10;
      blendedScore = (sentimentScore * 0.6) + (sliderNormalized * 0.4);
    }

    const riskScore = Math.round((1.0 - blendedScore) * 100) / 100;
    let riskTier: 'low' | 'medium' | 'high';
    if (riskScore < 0.3) riskTier = 'low';
    else if (riskScore < 0.6) riskTier = 'medium';
    else riskTier = 'high';

    // Update session
    await supabaseServer
      .from('sessions')
      .update({ risk_score: riskScore, risk_tier: riskTier, last_active: new Date().toISOString() })
      .eq('session_hash', sessionId);

    // Insert event
    await supabaseServer.from('events').insert({
      session_hash: sessionId,
      event_type: 'mood_checkin',
      sentiment_score: blendedScore,
      mood_emoji: emojiIndex,
      slider_value: sliderValue ?? null,
    });

    return res.json({ riskTier, riskScore });
  } catch (err) {
    console.error('Mood submit error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
