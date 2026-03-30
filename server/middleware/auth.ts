import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'admin' | 'volunteer';
  };
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  if (!authHeader) return res.status(401).json({ error: 'Access denied. No Authorization header provided.' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
     return res.status(401).json({ error: 'Access denied. Invalid token format. Expected Bearer.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string; role: 'admin' | 'volunteer' };
    req.user = decoded; // { id, role: 'admin' | 'volunteer' }
    next();
  } catch (ex) {
    console.error("JWT Verification failed.");
    res.status(400).json({ error: 'Invalid or expired token.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  auth(req, res, () => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    next();
  });
}

export function volunteerOnly(req: AuthRequest, res: Response, next: NextFunction) {
  auth(req, res, () => {
    if (req.user?.role !== 'volunteer' && req.user?.role !== 'admin') {
       return res.status(403).json({ error: 'Access denied. Volunteer privileges required.' });
    }
    next();
  });
}
