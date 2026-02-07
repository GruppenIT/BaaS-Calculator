import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db/database';
import { generateToken, authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    return;
  }

  const user = db.prepare('SELECT id, username, password_hash, name, role FROM users WHERE username = ?').get(username) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
    return;
  }

  const token = generateToken(user.id, user.username, user.role);
  res.json({ token, user: { id: user.id, username: user.username, name: user.name, role: user.role } });
});

router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare('SELECT id, username, name, role, created_at FROM users WHERE id = ?').get(req.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }
  res.json(user);
});

// Change own password
router.put('/change-password', authMiddleware, (req: AuthRequest, res: Response) => {
  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    res.status(400).json({ error: 'Senha atual e nova senha são obrigatórias' });
    return;
  }

  if (new_password.length < 4) {
    res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres' });
    return;
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.userId) as any;
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    res.status(401).json({ error: 'Senha atual incorreta' });
    return;
  }

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.userId);
  res.json({ success: true, message: 'Senha alterada com sucesso' });
});

// ============================================================
// User Management (admin only)
// ============================================================
router.get('/users', authMiddleware, adminOnly, (_req: AuthRequest, res: Response) => {
  const users = db.prepare('SELECT id, username, name, role, created_at FROM users ORDER BY name').all();
  res.json(users);
});

router.post('/users', authMiddleware, adminOnly, (req: AuthRequest, res: Response) => {
  const { username, password, name, role } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ error: 'Usuário, senha e nome são obrigatórios' });
    return;
  }

  const validRoles = ['admin', 'vendedor'];
  const userRole = validRoles.includes(role) ? role : 'vendedor';

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    res.status(409).json({ error: 'Usuário já existe' });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(username, hash, name, userRole);
  res.status(201).json({ id: result.lastInsertRowid, username, name, role: userRole });
});

router.put('/users/:id', authMiddleware, adminOnly, (req: AuthRequest, res: Response) => {
  const { name, role, password } = req.body;
  const targetId = Number(req.params.id);

  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
  if (!existing) {
    res.status(404).json({ error: 'Usuário não encontrado' });
    return;
  }

  const validRoles = ['admin', 'vendedor'];
  const userRole = validRoles.includes(role) ? role : 'vendedor';

  if (password) {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET name = ?, role = ?, password_hash = ? WHERE id = ?').run(name, userRole, hash, targetId);
  } else {
    db.prepare('UPDATE users SET name = ?, role = ? WHERE id = ?').run(name, userRole, targetId);
  }

  res.json({ id: targetId, name, role: userRole });
});

router.delete('/users/:id', authMiddleware, adminOnly, (req: AuthRequest, res: Response) => {
  const targetId = Number(req.params.id);

  if (targetId === req.userId) {
    res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' });
    return;
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  res.json({ success: true });
});

export default router;
