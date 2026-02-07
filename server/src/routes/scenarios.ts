import { Router, Response } from 'express';
import db from '../db/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { calculateScenario, ScenarioInput } from '../services/calculator';

const router = Router();
router.use(authMiddleware);

// List all scenarios (everyone can see all scenarios)
router.get('/', (req: AuthRequest, res: Response) => {
  const scenarios = db.prepare(
    `SELECT s.id, s.name, s.client_name, s.seller_name, s.user_id, s.created_at, s.updated_at, u.name as author_name
     FROM scenarios s LEFT JOIN users u ON s.user_id = u.id
     ORDER BY s.updated_at DESC`
  ).all();
  res.json(scenarios);
});

// Get a single scenario (everyone can view any scenario)
router.get('/:id', (req: AuthRequest, res: Response) => {
  const scenario = db.prepare(
    `SELECT s.*, u.name as author_name FROM scenarios s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?`
  ).get(req.params.id) as any;
  if (!scenario) {
    res.status(404).json({ error: 'Cenário não encontrado' });
    return;
  }
  if (scenario.results) {
    scenario.results = JSON.parse(scenario.results);
  }
  res.json(scenario);
});

// Create a new scenario
router.post('/', (req: AuthRequest, res: Response) => {
  const {
    name, client_name, seller_name, opportunity_number, opportunity_name,
    needs_veeam_licensing, needs_managed_services, needs_local_hardware,
    needs_cloud_storage, needs_o365_backup, vm_count, physical_server_count,
    veeam_points_level, veeam_edition, local_storage_tb, cloud_storage_tb,
    mailbox_count, server_acquisition_cost, has_dual_backup, dollar_rate, tax_rate,
  } = req.body;

  // Calculate results
  const input: ScenarioInput = {
    needs_veeam_licensing: !!needs_veeam_licensing,
    needs_managed_services: !!needs_managed_services,
    needs_local_hardware: !!needs_local_hardware,
    needs_cloud_storage: !!needs_cloud_storage,
    needs_o365_backup: !!needs_o365_backup,
    vm_count: vm_count || 0,
    physical_server_count: physical_server_count || 0,
    veeam_points_level: veeam_points_level || '10k points',
    veeam_edition: veeam_edition || 'Veeam Backup & Replication ENT Plus',
    local_storage_tb: local_storage_tb || 0,
    cloud_storage_tb: cloud_storage_tb || 0,
    mailbox_count: mailbox_count || 0,
    server_acquisition_cost: server_acquisition_cost || 0,
    has_dual_backup: !!has_dual_backup,
    dollar_rate: dollar_rate || 5.50,
    tax_rate: tax_rate || 0.18,
  };

  const results = calculateScenario(input);

  const result = db.prepare(`
    INSERT INTO scenarios (
      user_id, name, client_name, seller_name, opportunity_number, opportunity_name,
      needs_veeam_licensing, needs_managed_services, needs_local_hardware,
      needs_cloud_storage, needs_o365_backup, vm_count, physical_server_count,
      veeam_points_level, veeam_edition, local_storage_tb, cloud_storage_tb,
      mailbox_count, server_acquisition_cost, has_dual_backup, dollar_rate, tax_rate,
      results
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.userId, name || 'Novo Cenário', client_name || '', seller_name || '',
    opportunity_number || '', opportunity_name || '',
    needs_veeam_licensing ? 1 : 0, needs_managed_services ? 1 : 0,
    needs_local_hardware ? 1 : 0, needs_cloud_storage ? 1 : 0,
    needs_o365_backup ? 1 : 0, vm_count || 0, physical_server_count || 0,
    veeam_points_level || '10k points', veeam_edition || 'Veeam Backup & Replication ENT Plus',
    local_storage_tb || 0, cloud_storage_tb || 0, mailbox_count || 0,
    server_acquisition_cost || 0, has_dual_backup ? 1 : 0,
    dollar_rate || 5.50, tax_rate || 0.18,
    JSON.stringify(results)
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    results,
  });
});

// Update a scenario (own only for vendedor, any for admin)
router.put('/:id', (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id, user_id FROM scenarios WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Cenário não encontrado' });
    return;
  }
  if (req.userRole !== 'admin' && existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Você só pode editar seus próprios cenários' });
    return;
  }

  const {
    name, client_name, seller_name, opportunity_number, opportunity_name,
    needs_veeam_licensing, needs_managed_services, needs_local_hardware,
    needs_cloud_storage, needs_o365_backup, vm_count, physical_server_count,
    veeam_points_level, veeam_edition, local_storage_tb, cloud_storage_tb,
    mailbox_count, server_acquisition_cost, has_dual_backup, dollar_rate, tax_rate,
  } = req.body;

  // Recalculate
  const input: ScenarioInput = {
    needs_veeam_licensing: !!needs_veeam_licensing,
    needs_managed_services: !!needs_managed_services,
    needs_local_hardware: !!needs_local_hardware,
    needs_cloud_storage: !!needs_cloud_storage,
    needs_o365_backup: !!needs_o365_backup,
    vm_count: vm_count || 0,
    physical_server_count: physical_server_count || 0,
    veeam_points_level: veeam_points_level || '10k points',
    veeam_edition: veeam_edition || 'Veeam Backup & Replication ENT Plus',
    local_storage_tb: local_storage_tb || 0,
    cloud_storage_tb: cloud_storage_tb || 0,
    mailbox_count: mailbox_count || 0,
    server_acquisition_cost: server_acquisition_cost || 0,
    has_dual_backup: !!has_dual_backup,
    dollar_rate: dollar_rate || 5.50,
    tax_rate: tax_rate || 0.18,
  };

  const results = calculateScenario(input);

  db.prepare(`
    UPDATE scenarios SET
      name=?, client_name=?, seller_name=?, opportunity_number=?, opportunity_name=?,
      needs_veeam_licensing=?, needs_managed_services=?, needs_local_hardware=?,
      needs_cloud_storage=?, needs_o365_backup=?, vm_count=?, physical_server_count=?,
      veeam_points_level=?, veeam_edition=?, local_storage_tb=?, cloud_storage_tb=?,
      mailbox_count=?, server_acquisition_cost=?, has_dual_backup=?, dollar_rate=?, tax_rate=?,
      results=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(
    name || 'Novo Cenário', client_name || '', seller_name || '',
    opportunity_number || '', opportunity_name || '',
    needs_veeam_licensing ? 1 : 0, needs_managed_services ? 1 : 0,
    needs_local_hardware ? 1 : 0, needs_cloud_storage ? 1 : 0,
    needs_o365_backup ? 1 : 0, vm_count || 0, physical_server_count || 0,
    veeam_points_level || '10k points', veeam_edition || 'Veeam Backup & Replication ENT Plus',
    local_storage_tb || 0, cloud_storage_tb || 0, mailbox_count || 0,
    server_acquisition_cost || 0, has_dual_backup ? 1 : 0,
    dollar_rate || 5.50, tax_rate || 0.18,
    JSON.stringify(results),
    req.params.id
  );

  res.json({ id: Number(req.params.id), results });
});

// Delete a scenario (own only for vendedor, any for admin)
router.delete('/:id', (req: AuthRequest, res: Response) => {
  const existing = db.prepare('SELECT id, user_id FROM scenarios WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Cenário não encontrado' });
    return;
  }
  if (req.userRole !== 'admin' && existing.user_id !== req.userId) {
    res.status(403).json({ error: 'Você só pode excluir seus próprios cenários' });
    return;
  }
  db.prepare('DELETE FROM scenarios WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Calculate without saving (preview)
router.post('/calculate', (req: AuthRequest, res: Response) => {
  const input: ScenarioInput = {
    needs_veeam_licensing: !!req.body.needs_veeam_licensing,
    needs_managed_services: !!req.body.needs_managed_services,
    needs_local_hardware: !!req.body.needs_local_hardware,
    needs_cloud_storage: !!req.body.needs_cloud_storage,
    needs_o365_backup: !!req.body.needs_o365_backup,
    vm_count: req.body.vm_count || 0,
    physical_server_count: req.body.physical_server_count || 0,
    veeam_points_level: req.body.veeam_points_level || '10k points',
    veeam_edition: req.body.veeam_edition || 'Veeam Backup & Replication ENT Plus',
    local_storage_tb: req.body.local_storage_tb || 0,
    cloud_storage_tb: req.body.cloud_storage_tb || 0,
    mailbox_count: req.body.mailbox_count || 0,
    server_acquisition_cost: req.body.server_acquisition_cost || 0,
    has_dual_backup: !!req.body.has_dual_backup,
    dollar_rate: req.body.dollar_rate || 5.50,
    tax_rate: req.body.tax_rate || 0.18,
  };

  const results = calculateScenario(input);
  res.json(results);
});

export default router;
