import './env';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socket/handlers';
import chatRoutes from './routes/chat';
import behaviorRoutes from './routes/behavior';
import volunteerRoutes from './routes/volunteer';
import adminRoutes from './routes/admin';
import eventRoutes from './routes/events';
import sessionRoutes from './routes/session';
import authRoutes from './routes/auth';
import { supabaseAdmin } from '../lib/supabase';

const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();

// Lenient CORS for debugging
const corsOptions = {
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Root route for simple confirmation
app.get('/', (req, res) => {
  res.json({ 
    message: "🚀 SSS Backend is ACTIVE!", 
    time: new Date().toISOString(),
    cors: "Lenient Mode ON"
  });
});

// CORS diagnostic route
app.get('/api/debug/cors', (req, res) => {
  res.json({
    origin: req.headers.origin || 'No origin',
    frontendUrl: process.env.FRONTEND_URL || 'Not Set'
  });
});

// Fetch session history for volunteer context
app.get('/api/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { data, error } = await supabaseAdmin
            .from('sessions')
            .select('*')
            .eq('session_id', sessionId)
            .single();

        if (error || !data) return res.status(404).json({ error: 'Session not found' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions, // Use the same robust options for Socket.io
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  registerSocketHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Mounted API Routes
app.use('/api', chatRoutes);
app.use('/api', behaviorRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/session', sessionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', info: 'API is functional' });
});

server.listen(PORT, () => {
  console.log(`🚀 SSS Server is running on port ${PORT}`);
});
