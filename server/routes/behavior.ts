import { Router, Response } from 'express';
import { supabaseAdmin } from '../../lib/supabase';
import { AuthRequest, volunteerOnly } from '../middleware/auth';

const router = Router();

function calculateRisk(report: any) {
  let score = 0;
  const highFlags = ['crying often', 'sudden anger', 'fearful behavior'];
  const medFlags = ['silent', 'avoiding school'];

  const changesArray = Array.isArray(report.behaviorChanges) ? report.behaviorChanges : [];
  changesArray.forEach((f: string) => {
    const term = typeof f === 'string' ? f.toLowerCase() : '';
    if (highFlags.includes(term)) score += 3;
    if (medFlags.includes(term)) score += 1;
  });
  
  const mood = (report.mood || "").toLowerCase();
  if (mood === 'sad' || mood === 'fearful' || mood === 'angry') score += 2;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

// POST /api/behavior/report (Public)
router.post('/behavior/report', async (req, res) => {
  try {
    const data = req.body;
    if (!data.ageGroup) return res.status(400).json({ error: "Missing required fields" });

    const risk = calculateRisk(data);

    // 1. Save Behavior Report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('behavior_reports')
      .insert({
          reporter_type: data.reporterType,
          student_name: data.studentName,
          school_name: data.schoolName,
          student_phone: data.studentPhone,
          student_age: data.studentAge ? parseInt(data.studentAge) : null,
          age_group: data.ageGroup,
          mood: data.mood,
          behavior_changes: data.behaviorChanges,
          social_flags: data.socialFlags,
          academic_flags: data.academicFlags,
          notes: data.notes
      })
      .select()
      .single();

    if (reportError) {
        console.error("Supabase Report Error:", reportError);
        return res.status(500).json({ error: 'Failed to record behavior report' });
    }

    // 2. Generate Flagged Case if risk is Medium or High
    if (risk === 'medium' || risk === 'high') {
      const bArray = Array.isArray(data.behaviorChanges) ? data.behaviorChanges.join(', ') : "unknown behaviors";
      const focus = (data.behaviorChanges || []).includes('silent') ? 'School Withdrawal' : 'Emotional Distress';
      
      const ageStr = data.studentAge ? ` (${data.studentAge}y)` : '';
      const studentTag = data.studentName ? `${data.studentName}${ageStr} at ${data.schoolName || 'Unknown School'}` : 'a child';

      const { error: caseError } = await supabaseAdmin
        .from('flagged_cases')
        .insert({
            report_id: report.id,
            age_group: data.ageGroup,
            risk_level: risk,
            detected_concern: `Concern for ${studentTag}: ${focus}`,
            ai_summary: `Observatory Report for ${studentTag}. The student was feeling ${data.mood || 'distressed'} and showing ${bArray}. Observer Context: ${data.notes || 'No extra notes provided.'}`,
            guidance: {
              approach: "Approach gently and observe first. Ensure a safe, private setting.",
              whatToSay: ["I'm here for you.", "Would you like to sit here? No pressure to talk."],
              dos: ["Be patient", "Listen carefully", "Offer physical comfort like water"],
              donts: ["Push for answers", "Judge their behavior", "Invalidate feelings"]
            }
        });

      if (caseError) {
          console.error("Supabase Flagged Case Error:", caseError);
      }

      return res.json({ success: true, caseGenerated: true, riskLevel: risk, msg: "Case flagged for volunteer support." });
    }

    res.json({ success: true, caseGenerated: false, msg: "Observation safely recorded." });
  } catch (err) {
    console.error("Behavior Error:", err);
    res.status(500).json({ error: 'Failed to record behavior properly' });
  }
});

// GET /api/cases (Protected/Volunteer)
router.get('/cases', volunteerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { data: cases, error } = await supabaseAdmin
      .from('flagged_cases')
      .select('*')
      .neq('intervention_status', 'resolved')
      .order('created_at', { ascending: false });

    if (error) {
        console.error("Supabase Fetch Cases Error:", error);
        return res.status(500).json({ error: 'Failed to fetch cases' });
    }

    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET /api/cases/:id (Protected/Volunteer)
router.get('/cases/:id', volunteerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { data: c, error } = await supabaseAdmin
      .from('flagged_cases')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !c) return res.status(404).json({ error: 'Not found' });

    // Fetch original report context if it exists (for Observatory reports)
    let reportContext = null;
    if (c.report_id) {
        const { data: report } = await supabaseAdmin
            .from('behavior_reports')
            .select('*')
            .eq('id', c.report_id)
            .single();
        reportContext = report;
    }

    // Fetch user context if it exists (for Live Chat sessions)
    let sessionContext = null;
    if (c.session_id) {
        const { data: session } = await supabaseAdmin
            .from('sessions')
            .select('user_name, age_group, phone')
            .eq('session_id', c.session_id)
            .single();
        sessionContext = session;
    }

    res.json({ ...c, reportContext, sessionContext });
  } catch (err) {
    res.status(500).json({ error: 'Failed to find case' });
  }
});

// PATCH /api/cases/:id/status (Protected/Volunteer)
router.patch('/cases/:id/status', volunteerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('flagged_cases')
      .update({ intervention_status: status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ error: 'Case not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error("Status Update Error:", err);
    res.status(500).json({ error: 'Failed to update case status' });
  }
});

export default router;
