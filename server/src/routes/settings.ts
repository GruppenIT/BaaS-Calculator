import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();

const uploadsDir = path.join(__dirname, '..', '..', 'data', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo não suportado. Use PNG, JPG, SVG ou WebP.'));
    }
  },
});

// Upload logo (admin only)
router.post('/logo', authMiddleware, adminOnly, (req: AuthRequest, res: Response) => {
  upload.single('logo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'Arquivo muito grande. Máximo: 2MB.' });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    }
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      return;
    }

    // Remove old logos with different extensions
    const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
    const currentExt = path.extname(req.file.filename).toLowerCase();
    for (const ext of allowed) {
      if (ext !== currentExt) {
        const oldFile = path.join(uploadsDir, `logo${ext}`);
        if (fs.existsSync(oldFile)) {
          fs.unlinkSync(oldFile);
        }
      }
    }

    res.json({
      success: true,
      message: 'Logo atualizado com sucesso.',
      filename: req.file.filename,
    });
  });
});

// Get current logo info (public)
router.get('/logo', (_req: Request, res: Response) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  for (const ext of allowed) {
    const filePath = path.join(uploadsDir, `logo${ext}`);
    if (fs.existsSync(filePath)) {
      res.json({ hasCustomLogo: true, filename: `logo${ext}` });
      return;
    }
  }
  res.json({ hasCustomLogo: false, filename: null });
});

// Delete custom logo (admin only)
router.delete('/logo', authMiddleware, adminOnly, (_req: AuthRequest, res: Response) => {
  const allowed = ['.png', '.jpg', '.jpeg', '.svg', '.webp'];
  let deleted = false;
  for (const ext of allowed) {
    const filePath = path.join(uploadsDir, `logo${ext}`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deleted = true;
    }
  }
  res.json({ success: true, deleted });
});

export default router;
