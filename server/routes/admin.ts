import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, adminOnly } from '../middleware/auth';
import { supabaseAdmin } from '../../lib/supabase';

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

    // Otherwise check Supabase
    const { data: admin, error } = await supabaseAdmin
        .from('admins')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

    if (error || !admin) return res.status(401).json({ error: 'Invalid admin credentials' });
    
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
    const { count: totalSessions } = await supabaseAdmin.from('sessions').select('*', { count: 'exact', head: true });
    const { count: totalBehaviorReports } = await supabaseAdmin.from('behavior_reports').select('*', { count: 'exact', head: true });
    const { count: flaggedCasesCounts } = await supabaseAdmin.from('flagged_cases').select('*', { count: 'exact', head: true });
    
    // Risk Levels for Flagged Cases
    const { count: high } = await supabaseAdmin.from('flagged_cases').select('*', { count: 'exact', head: true }).eq('risk_level', 'high');
    const { count: medium } = await supabaseAdmin.from('flagged_cases').select('*', { count: 'exact', head: true }).eq('risk_level', 'medium');
    const { count: low } = await supabaseAdmin.from('flagged_cases').select('*', { count: 'exact', head: true }).eq('risk_level', 'low');

    // Topic Aggregation (from completed sessions)
    const { data: topicsData } = await supabaseAdmin
      .from('sessions')
      .select('topic_category')
      .not('topic_category', 'is', null);
    
    const topicCounts: Record<string, number> = {};
    topicsData?.forEach(s => {
      topicCounts[s.topic_category] = (topicCounts[s.topic_category] || 0) + 1;
    });

    // Age Group Aggregation
    const { data: ageData } = await supabaseAdmin
      .from('sessions')
      .select('age_group_segment')
      .not('age_group_segment', 'is', null);
    
    const ageCounts: Record<string, number> = {};
    ageData?.forEach(s => {
      ageCounts[s.age_group_segment] = (ageCounts[s.age_group_segment] || 0) + 1;
    });

    // Detailed Session Insights
    const { data: recentSessions } = await supabaseAdmin
      .from('sessions')
      .select('id, session_id, age_group_segment, topic_category, ai_summary, created_at')
      .eq('is_completed', true)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: volunteers } = await supabaseAdmin.from('volunteers').select('*').order('created_at', { ascending: false });
    
    // Behavior Reports Log
    const { data: behaviorReports } = await supabaseAdmin
      .from('behavior_reports')
      .select('*')
      .order('timestamp', { ascending: false });

    // Exercise Adherence (Medium/High Risk Users)
    const { data: medHighSessions, error: adherenceError } = await supabaseAdmin
      .from('sessions')
      .select('exercise_completions')
      .in('risk_tier', ['medium', 'high']);
    
    let adherenceCount = 0;
    const totalMedHigh = medHighSessions?.length || 0;
    medHighSessions?.forEach(s => {
       if (Array.isArray(s.exercise_completions) && s.exercise_completions.length > 0) {
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
    
    const { data: vol, error } = await supabaseAdmin
        .from('volunteers')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();

    if (error || !vol) return res.status(404).json({ error: "Volunteer not found" });

    res.json({ success: true, volunteer: vol });
  } catch(err) {
    console.error("Volunteer Update Error:", err);
    res.status(500).json({ error: 'Update failed safely' });
  }
});

export default router;
