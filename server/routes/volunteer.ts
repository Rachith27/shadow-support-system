import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../../lib/supabase';
import { AuthRequest, auth } from '../middleware/auth';

const router = Router();

// POST /api/volunteer/register
router.post('/register', async (req, res) => {
  console.log("HIT /register endpoint! Body:", req.body);
  try {
    const { fullName, email, phone, location, skills, availability, motivation, password } = req.body;
    
    if (!fullName || !email || !password) {
       console.log("Missing fields");
       return res.status(400).json({ error: "Missing required fields." });
    }

    // 1. Check if email already registered in Supabase
    const { data: existing, error: checkErr } = await supabaseAdmin
      .from('volunteers')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (checkErr) console.error("Check existing error:", checkErr);

    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    // 2. Create entry in volunteers table with 'pending' status
    const { error } = await supabaseAdmin
      .from('volunteers')
      .insert({
        full_name: fullName,
        email,
        phone,
        location,
        skills,
        availability,
        motivation,
        password, // Note: Plaintext as per original prototype, should be hashed in production
        status: 'pending'
      });

    if (error) {
        console.error("Supabase Register Error:", error);
        return res.status(500).json({ error: 'Registration failed.' });
    }
    
    res.json({ success: true, message: 'Registration submitted. Pending admin approval.' });
  } catch(err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: 'Registration failed safely' });
  }
});

// POST /api/volunteer/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required." });

    const { data: vol, error } = await supabaseAdmin
      .from('volunteers')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !vol) return res.status(401).json({ error: 'Invalid email or password.' });
    
    if (vol.status === 'pending') return res.status(403).json({ error: 'Account pending admin approval.' });
    if (vol.status === 'rejected') return res.status(403).json({ error: 'Account rejected.' });

    // Generate JWT for the Express session
    const token = jwt.sign(
        { id: vol.id, role: 'volunteer' }, 
        process.env.JWT_SECRET || 'secret', 
        { expiresIn: '8h' }
    );

    res.json({ success: true, token, volunteer: vol });
  } catch(err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: 'Login failure handled' });
  }
});

// GET /api/volunteer/me (Protected)
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: vol, error: volError } = await supabaseAdmin
      .from('volunteers')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (volError || !vol) return res.status(404).json({ error: 'Volunteer not found' });
    
    // Fetch all pending flagged cases for the volunteer to see
    const { data: cases, error: casesError } = await supabaseAdmin
      .from('flagged_cases')
      .select('*')
      .eq('intervention_status', 'pending')
      .order('created_at', { ascending: false });

    if (casesError) {
        console.error("Dashboard Fetch Error:", casesError);
    }
    
    res.json({ volunteer: vol, cases: cases || [] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build dashboard data' });
  }
});

export default router;
