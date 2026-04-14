import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
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

    // 1. Check if email already registered in Prisma
    try {
        const existing = await prisma.volunteer.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered.' });
    } catch (checkErr) {
        console.error("Check existing error:", checkErr);
    }

    // 2. Create entry in volunteers table with 'pending' status
    try {
        await prisma.volunteer.create({
            data: {
                full_name: fullName,
                email,
                phone,
                location,
                skills,
                availability,
                motivation,
                password, // Note: Plaintext as per original prototype, should be hashed in production
                status: 'pending'
            }
        });
    } catch (error) {
        console.error("Prisma Register Error:", error);
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

    const vol = await prisma.volunteer.findFirst({
        where: { email, password }
    });

    if (!vol) return res.status(401).json({ error: 'Invalid email or password.' });
    
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

    const vol = await prisma.volunteer.findUnique({
      where: { id: req.user.id }
    });

    if (!vol) return res.status(404).json({ error: 'Volunteer not found' });
    
    // Fetch all pending flagged cases for the volunteer to see
    let cases: Record<string, unknown>[] = [];
    try {
        cases = await prisma.flaggedCase.findMany({
            where: { intervention_status: 'pending' },
            orderBy: { created_at: 'desc' }
        });
    } catch (casesError) {
        console.error("Dashboard Fetch Error:", casesError);
    }
    
    res.json({ volunteer: vol, cases: cases || [] });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to build dashboard data' });
  }
});

export default router;
