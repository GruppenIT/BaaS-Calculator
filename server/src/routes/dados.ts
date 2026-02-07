import { Router, Response } from 'express';
import db from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

// ============================================================
// Veeam Products
// ============================================================
router.get('/veeam-products', (_req: AuthRequest, res: Response) => {
  const products = db.prepare('SELECT * FROM veeam_products ORDER BY edition, type').all();
  res.json(products);
});

router.post('/veeam-products', (req: AuthRequest, res: Response) => {
  const { edition, detail, type, points } = req.body;
  const result = db.prepare('INSERT INTO veeam_products (edition, detail, type, points) VALUES (?, ?, ?, ?)').run(edition, detail || '', type, points);
  res.status(201).json({ id: result.lastInsertRowid, edition, detail, type, points });
});

router.put('/veeam-products/:id', (req: AuthRequest, res: Response) => {
  const { edition, detail, type, points } = req.body;
  db.prepare('UPDATE veeam_products SET edition=?, detail=?, type=?, points=? WHERE id=?').run(edition, detail || '', type, points, req.params.id);
  res.json({ id: Number(req.params.id), edition, detail, type, points });
});

router.delete('/veeam-products/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM veeam_products WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// Points Intervals
// ============================================================
router.get('/points-intervals', (_req: AuthRequest, res: Response) => {
  const intervals = db.prepare('SELECT * FROM points_intervals ORDER BY id').all();
  res.json(intervals);
});

router.post('/points-intervals', (req: AuthRequest, res: Response) => {
  const { interval_name, value_per_point } = req.body;
  const result = db.prepare('INSERT INTO points_intervals (interval_name, value_per_point) VALUES (?, ?)').run(interval_name, value_per_point);
  res.status(201).json({ id: result.lastInsertRowid, interval_name, value_per_point });
});

router.put('/points-intervals/:id', (req: AuthRequest, res: Response) => {
  const { interval_name, value_per_point } = req.body;
  db.prepare('UPDATE points_intervals SET interval_name=?, value_per_point=? WHERE id=?').run(interval_name, value_per_point, req.params.id);
  res.json({ id: Number(req.params.id), interval_name, value_per_point });
});

router.delete('/points-intervals/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM points_intervals WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// Management Pricing
// ============================================================
router.get('/management-pricing', (_req: AuthRequest, res: Response) => {
  const pricing = db.prepare('SELECT * FROM management_pricing ORDER BY id').all();
  res.json(pricing);
});

router.post('/management-pricing', (req: AuthRequest, res: Response) => {
  const { type, charge_basis, setup_cost, monthly_cost } = req.body;
  const result = db.prepare('INSERT INTO management_pricing (type, charge_basis, setup_cost, monthly_cost) VALUES (?, ?, ?, ?)').run(type, charge_basis, setup_cost, monthly_cost);
  res.status(201).json({ id: result.lastInsertRowid, type, charge_basis, setup_cost, monthly_cost });
});

router.put('/management-pricing/:id', (req: AuthRequest, res: Response) => {
  const { type, charge_basis, setup_cost, monthly_cost } = req.body;
  db.prepare('UPDATE management_pricing SET type=?, charge_basis=?, setup_cost=?, monthly_cost=? WHERE id=?').run(type, charge_basis, setup_cost, monthly_cost, req.params.id);
  res.json({ id: Number(req.params.id), type, charge_basis, setup_cost, monthly_cost });
});

router.delete('/management-pricing/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM management_pricing WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// Storage On-Premise
// ============================================================
router.get('/storage-onpremise', (_req: AuthRequest, res: Response) => {
  const storage = db.prepare('SELECT * FROM storage_onpremise ORDER BY tb_amount').all();
  res.json(storage);
});

router.post('/storage-onpremise', (req: AuthRequest, res: Response) => {
  const { tb_amount, monthly_cost } = req.body;
  const result = db.prepare('INSERT INTO storage_onpremise (tb_amount, monthly_cost) VALUES (?, ?)').run(tb_amount, monthly_cost);
  res.status(201).json({ id: result.lastInsertRowid, tb_amount, monthly_cost });
});

router.put('/storage-onpremise/:id', (req: AuthRequest, res: Response) => {
  const { tb_amount, monthly_cost } = req.body;
  db.prepare('UPDATE storage_onpremise SET tb_amount=?, monthly_cost=? WHERE id=?').run(tb_amount, monthly_cost, req.params.id);
  res.json({ id: Number(req.params.id), tb_amount, monthly_cost });
});

router.delete('/storage-onpremise/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM storage_onpremise WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// Storage Cloud
// ============================================================
router.get('/storage-cloud', (_req: AuthRequest, res: Response) => {
  const storage = db.prepare('SELECT * FROM storage_cloud ORDER BY id').all();
  res.json(storage);
});

router.post('/storage-cloud', (req: AuthRequest, res: Response) => {
  const { name, base_price, min_tb, max_tb } = req.body;
  const result = db.prepare('INSERT INTO storage_cloud (name, base_price, min_tb, max_tb) VALUES (?, ?, ?, ?)').run(name, base_price, min_tb, max_tb);
  res.status(201).json({ id: result.lastInsertRowid, name, base_price, min_tb, max_tb });
});

router.put('/storage-cloud/:id', (req: AuthRequest, res: Response) => {
  const { name, base_price, min_tb, max_tb } = req.body;
  db.prepare('UPDATE storage_cloud SET name=?, base_price=?, min_tb=?, max_tb=? WHERE id=?').run(name, base_price, min_tb, max_tb, req.params.id);
  res.json({ id: Number(req.params.id), name, base_price, min_tb, max_tb });
});

router.delete('/storage-cloud/:id', (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM storage_cloud WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ============================================================
// Margins
// ============================================================
router.get('/margins', (_req: AuthRequest, res: Response) => {
  const margins = db.prepare('SELECT * FROM margins ORDER BY id').all();
  res.json(margins);
});

router.put('/margins/:id', (req: AuthRequest, res: Response) => {
  const { type, aggressive, moderate, conservative } = req.body;
  db.prepare('UPDATE margins SET type=?, aggressive=?, moderate=?, conservative=? WHERE id=?').run(type, aggressive, moderate, conservative, req.params.id);
  res.json({ id: Number(req.params.id), type, aggressive, moderate, conservative });
});

// ============================================================
// Server ROI
// ============================================================
router.get('/server-roi', (_req: AuthRequest, res: Response) => {
  const roi = db.prepare('SELECT * FROM server_roi ORDER BY id').all();
  res.json(roi);
});

router.put('/server-roi/:id', (req: AuthRequest, res: Response) => {
  const { risk_level, aggressive_months, moderate_months, conservative_months } = req.body;
  db.prepare('UPDATE server_roi SET risk_level=?, aggressive_months=?, moderate_months=?, conservative_months=? WHERE id=?').run(risk_level, aggressive_months, moderate_months, conservative_months, req.params.id);
  res.json({ id: Number(req.params.id), risk_level, aggressive_months, moderate_months, conservative_months });
});

// ============================================================
// Management Multipliers
// ============================================================
router.get('/management-multipliers', (_req: AuthRequest, res: Response) => {
  const multipliers = db.prepare('SELECT * FROM management_multipliers ORDER BY id').all();
  res.json(multipliers);
});

router.put('/management-multipliers/:id', (req: AuthRequest, res: Response) => {
  const { risk_level, aggressive, moderate, conservative } = req.body;
  db.prepare('UPDATE management_multipliers SET risk_level=?, aggressive=?, moderate=?, conservative=? WHERE id=?').run(risk_level, aggressive, moderate, conservative, req.params.id);
  res.json({ id: Number(req.params.id), risk_level, aggressive, moderate, conservative });
});

// ============================================================
// Tax Config
// ============================================================
router.get('/tax-config', (_req: AuthRequest, res: Response) => {
  const config = db.prepare('SELECT * FROM tax_config ORDER BY id').all();
  res.json(config);
});

router.put('/tax-config/:id', (req: AuthRequest, res: Response) => {
  const { name, rate } = req.body;
  db.prepare('UPDATE tax_config SET name=?, rate=? WHERE id=?').run(name, rate, req.params.id);
  res.json({ id: Number(req.params.id), name, rate });
});

// ============================================================
// All Data (for dropdowns and references)
// ============================================================
router.get('/all', (_req: AuthRequest, res: Response) => {
  const veeamProducts = db.prepare('SELECT * FROM veeam_products ORDER BY edition, type').all();
  const pointsIntervals = db.prepare('SELECT * FROM points_intervals ORDER BY id').all();
  const managementPricing = db.prepare('SELECT * FROM management_pricing ORDER BY id').all();
  const storageOnpremise = db.prepare('SELECT * FROM storage_onpremise ORDER BY tb_amount').all();
  const storageCloud = db.prepare('SELECT * FROM storage_cloud ORDER BY id').all();
  const margins = db.prepare('SELECT * FROM margins ORDER BY id').all();
  const serverRoi = db.prepare('SELECT * FROM server_roi ORDER BY id').all();
  const managementMultipliers = db.prepare('SELECT * FROM management_multipliers ORDER BY id').all();
  const taxConfig = db.prepare('SELECT * FROM tax_config ORDER BY id').all();

  // Get unique editions for dropdowns
  const editions = db.prepare("SELECT DISTINCT edition FROM veeam_products WHERE type = 'VM' ORDER BY edition").all();

  res.json({
    veeamProducts,
    pointsIntervals,
    managementPricing,
    storageOnpremise,
    storageCloud,
    margins,
    serverRoi,
    managementMultipliers,
    taxConfig,
    editions,
  });
});

export default router;
