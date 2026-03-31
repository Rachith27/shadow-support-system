import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../../lib/supabase';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sss-shadow-support-secret-2026';

router.post('/register', async (req, res) => {
    try {
        const { email, password, full_name, age_group } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { data, error } = await supabaseAdmin
            .from('users')
            .insert([{ email, password: hashedPassword, full_name, age_group }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                 return res.status(400).json({ error: 'Email already exists' });
            }
            throw error;
        }

        const token = jwt.sign({ id: data.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user: data });
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data: user, error } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/me', async (req, res) => {
     try {
         const authHeader = req.headers.authorization;
         if (!authHeader) return res.status(401).json({ error: 'No token' });
         const token = authHeader.split(' ')[1];
         
         const payload = jwt.verify(token, JWT_SECRET) as { id: string, role: string };
         if (payload.role !== 'user') return res.status(403).json({ error: 'Not authorized' });

         const { data: user, error } = await supabaseAdmin
             .from('users')
             .select('id, email, full_name, age_group, created_at')
             .eq('id', payload.id)
             .single();
         
         if (error || !user) return res.status(404).json({ error: 'User not found' });
         res.json({ user });
     } catch (err) {
         res.status(401).json({ error: 'Invalid token' });
     }
});

export default router;
