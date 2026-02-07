import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'baas-calculator-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: number;
  userName?: string;
  userRole?: string;
}

export function generateToken(userId: number, username: string, role: string): string {
  return jwt.sign({ userId, username, role }, JWT_SECRET, { expiresIn: '24h' });
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token não fornecido' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; username: string; role: string };
    req.userId = decoded.userId;
    req.userName = decoded.username;
    req.userRole = decoded.role;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito a administradores' });
    return;
  }
  next();
}
