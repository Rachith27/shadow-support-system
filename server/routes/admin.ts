import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, adminOnly } from '../middleware/auth';
import { prisma } from '../../lib/prisma';

const router = Router();

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check against .env master credentials
    const envEmail = process.env.ADMIN_EMAIL || "admin@safespace.org";
    const envPassword = process.env.ADMIN_PASSWORD || "admin";

    if (email === envEmail && password === envPassword) {
        const token = jwt.sign({ id: "master-admin", role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
        return res.json({ success: true, token, admin: { email: envEmail } });
    }

    // Otherwise check Prisma
    const admin = await prisma.admin.findFirst({
        where: { email, password }
    });

    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });
    
    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' });
    res.json({ success: true, token, admin });
    
  } catch(err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ error: 'Admin login failed gracefully' });
  }
});

// GET /api/admin/dashboard (Protected)
router.get('/dashboard', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const totalSessions = await prisma.session.count();
    const totalBehaviorReports = await prisma.behaviorReport.count();
    const flaggedCasesCounts = await prisma.flaggedCase.count();
    
    // Risk Levels for Flagged Cases
    const high = await prisma.flaggedCase.count({ where: { risk_level: 'high' } });
    const medium = await prisma.flaggedCase.count({ where: { risk_level: 'medium' } });
    const low = await prisma.flaggedCase.count({ where: { risk_level: 'low' } });

    // Topic Aggregation (from completed sessions)
    const topicsData = await prisma.session.findMany({
      where: { topic_category: { not: null } },
      select: { topic_category: true }
    });
    
    const topicCounts: Record<string, number> = {};
    topicsData?.forEach(s => {
      if (s.topic_category) {
        topicCounts[s.topic_category] = (topicCounts[s.topic_category] || 0) + 1;
      }
    });

    // Age Group Aggregation
    const ageData = await prisma.session.findMany({
      where: { age_group_segment: { not: null } },
      select: { age_group_segment: true }
    });
    
    const ageCounts: Record<string, number> = {};
    ageData?.forEach(s => {
      if (s.age_group_segment) {
        ageCounts[s.age_group_segment] = (ageCounts[s.age_group_segment] || 0) + 1;
      }
    });

    // Detailed Session Insights
    const recentSessions = await prisma.session.findMany({
      where: { is_completed: true },
      select: { id: true, session_id: true, age_group_segment: true, topic_category: true, ai_summary: true, created_at: true, chat_type: true },
      orderBy: { created_at: 'desc' },
      take: 10
    });

    const volunteers = await prisma.volunteer.findMany({ orderBy: { created_at: 'desc' } });
    
    // Behavior Reports Log
    const behaviorReports = await prisma.behaviorReport.findMany({
      orderBy: { timestamp: 'desc' }
    });

    // Exercise Adherence (Medium/High Risk Users)
    const medHighSessions = await prisma.session.findMany({
      where: { risk_tier: { in: ['medium', 'high'] } },
      select: { exercise_completions: true }
    });
    
    let adherenceCount = 0;
    const totalMedHigh = medHighSessions?.length || 0;
    medHighSessions?.forEach(s => {
       const completions = s.exercise_completions as unknown[];
       if (Array.isArray(completions) && completions.length > 0) {
          adherenceCount++;
       }
    });
    const exerciseAdherence = totalMedHigh > 0 ? Math.round((adherenceCount / totalMedHigh) * 100) : 0;

    res.json({
      totalSessions: totalSessions || 0,
      totalBehaviorReports: totalBehaviorReports || 0,
      flaggedCasesCounts: flaggedCasesCounts || 0,
      riskLevels: { high: high || 0, medium: medium || 0, low: low || 0 },
      topicInsights: topicCounts,
      ageInsights: ageCounts,
      recentInsights: recentSessions || [],
      volunteers: volunteers || [],
      behaviorReports: behaviorReports || [],
      exerciseAdherence
    });
  } catch(err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: 'Dashboard failed safely' });
  }
});

// PATCH /api/admin/volunteers/:id/status (Protected)
router.patch('/volunteers/:id/status', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status definition" });
    }
    try {
        const vol = await prisma.volunteer.update({
            where: { id: req.params.id as string },
            data: { status }
        });
        res.json({ success: true, volunteer: vol });
    } catch {
        return res.status(404).json({ error: "Volunteer not found" });
    }
  } catch(err) {
    console.error("Volunteer Update Error:", err);
    res.status(500).json({ error: 'Update failed safely' });
  }
});

export default router;
