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
import { supabaseAdmin } from '../lib/supabase';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

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
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
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
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/session', sessionRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
  console.log(`🚀 SSS Socket server running on port ${PORT}`);
});
