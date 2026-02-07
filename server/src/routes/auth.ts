import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  const user = db.prepare('SELECT id, username, password_hash, name FROM users WHERE username = ?').get(username) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  const token = generateToken(user.id, user.username);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name } });
});

router.post('/register', (req: Request, res: Response) => {
  const { username, password, name } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: 'Usuário já existe' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)').run(username, hash, name);

  const token = generateToken(result.lastInsertRowid as number, username);
  res.status(201).json({ token, user: { id: result.lastInsertRowid, username, name } });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, username, name, created_at FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.json(user);
});

export default router;
