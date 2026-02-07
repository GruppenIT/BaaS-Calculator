import db, { initializeDatabase } from './database';
import bcrypt from 'bcryptjs';

initializeDatabase();

console.log('Seeding database...');

// Clear existing data
const tables = [
  'veeam_products', 'points_intervals', 'management_pricing',
  'storage_onpremise', 'storage_cloud', 'margins',
  'server_roi', 'management_multipliers', 'tax_config'
];

for (const table of tables) {
  db.exec(`DELETE FROM ${table}`);
}

// ============================================================
// Veeam Products (Points per Unit - PPU) from Dados sheet F2:I23
// ============================================================
const veeamProducts = [
  // NAS type
  { edition: 'Veeam Backup & Replication ENT Plus', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: '500 GB NAS', points: 10 },
  // ENT apps
  { edition: 'Veeam Backup & Replication ENT Plus', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'ENT apps', points: 11 },
  // Kasten
  { edition: 'Kasten Backup', detail: 'Backup and DR with Kasten by Veeam', type: 'Node', points: 225 },
  // Cloud Connect Replica VM
  { edition: 'Veeam Cloud Connect', detail: 'for off-site backup and DRaaS of the Veeam Backup Package', type: 'Replica VM', points: 10 },
  // Server types
  { edition: 'Veeam Backup & Replication ENT Plus', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Server', points: 11 },
  { edition: 'Veeam Backup & Replication ENT', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Server', points: 11 },
  { edition: 'Veeam Backup & Replication STAN', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Server', points: 11 },
  // Cloud Connect Server
  { edition: 'Veeam Cloud Connect', detail: 'for off-site backup and DRaaS of the Veeam Backup Package', type: 'Server', points: 7 },
  // Agent AIX/Solaris
  { edition: 'Veeam Agent', detail: 'for IBM AIX and Oracle Solaris', type: 'Server', points: 11 },
  // Management Pack
  { edition: 'Veeam Management Pack', detail: 'for Microsoft System Center', type: 'Socket', points: 45 },
  // Veeam ONE
  { edition: 'Veeam ONE', detail: 'for monitoring of the Veeam Backup Package', type: 'Unit', points: 2 },
  // Office 365
  { edition: 'Veeam Backup for Microsoft Office 365', detail: '', type: 'User', points: 1.5 },
  // VM types
  { edition: 'Veeam Backup & Replication ENT Plus', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'VM', points: 11 },
  { edition: 'Veeam Backup & Replication ENT', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'VM', points: 9 },
  { edition: 'Veeam Backup & Replication STAN', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'VM', points: 5 },
  // Cloud Connect VM
  { edition: 'Veeam Cloud Connect', detail: 'for off-site backup and DRaaS of the Veeam Backup Package', type: 'VM', points: 5 },
  // DR Orchestrator
  { edition: 'Veeam DR Orchestrator', detail: 'for orchestration of the Veeam Backup Package', type: 'VM', points: 11 },
  // Workstation types
  { edition: 'Veeam Backup & Replication ENT Plus', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Workstation', points: 4 },
  { edition: 'Veeam Backup & Replication ENT', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Workstation', points: 4 },
  { edition: 'Veeam Backup & Replication STAN', detail: '+ Veeam Agents for Microsoft Windows and Linux', type: 'Workstation', points: 4 },
  // Cloud Connect Workstation
  { edition: 'Veeam Cloud Connect', detail: 'for off-site backup and DRaaS of the Veeam Backup Package', type: 'Workstation', points: 3 },
];

const insertProduct = db.prepare(
  'INSERT INTO veeam_products (edition, detail, type, points) VALUES (?, ?, ?, ?)'
);
for (const p of veeamProducts) {
  insertProduct.run(p.edition, p.detail, p.type, p.points);
}
console.log(`  Inserted ${veeamProducts.length} Veeam products`);

// ============================================================
// Points Intervals from Dados sheet K1:L10
// ============================================================
const pointsIntervals = [
  { interval_name: '200 points', value_per_point: 0.83 },
  { interval_name: '800 points', value_per_point: 0.79 },
  { interval_name: '1500 points', value_per_point: 0.76 },
  { interval_name: '3500 points', value_per_point: 0.72 },
  { interval_name: '5000 points', value_per_point: 0.68 },
  { interval_name: '10k points', value_per_point: 0.69 },
  { interval_name: '20k points', value_per_point: 0.62 },
  { interval_name: '50k points', value_per_point: 0.59 },
  { interval_name: '100k points', value_per_point: 0.57 },
];

const insertInterval = db.prepare(
  'INSERT INTO points_intervals (interval_name, value_per_point) VALUES (?, ?)'
);
for (const i of pointsIntervals) {
  insertInterval.run(i.interval_name, i.value_per_point);
}
console.log(`  Inserted ${pointsIntervals.length} points intervals`);

// ============================================================
// Management Pricing from Dados sheet A8:D10
// ============================================================
const managementPricing = [
  { type: 'VMs e Servers', charge_basis: 'por VM', setup_cost: 6, monthly_cost: 3 },
  { type: 'Office365 Users', charge_basis: 'por Tenant', setup_cost: 199, monthly_cost: 99 },
];

const insertMgmt = db.prepare(
  'INSERT INTO management_pricing (type, charge_basis, setup_cost, monthly_cost) VALUES (?, ?, ?, ?)'
);
for (const m of managementPricing) {
  insertMgmt.run(m.type, m.charge_basis, m.setup_cost, m.monthly_cost);
}
console.log(`  Inserted ${managementPricing.length} management pricing entries`);

// ============================================================
// Storage On-Premise from Dados sheet A13:B17
// ============================================================
const storageOnpremise = [
  { tb_amount: 10, monthly_cost: 237.6661187142263 },
  { tb_amount: 20, monthly_cost: 292.13127091956983 },
  { tb_amount: 30, monthly_cost: 341.6450456517003 },
  { tb_amount: 50, monthly_cost: 445.6239725891743 },
  { tb_amount: 100, monthly_cost: 690.7171575132202 },
];

const insertStorage = db.prepare(
  'INSERT INTO storage_onpremise (tb_amount, monthly_cost) VALUES (?, ?)'
);
for (const s of storageOnpremise) {
  insertStorage.run(s.tb_amount, s.monthly_cost);
}
console.log(`  Inserted ${storageOnpremise.length} on-premise storage entries`);

// ============================================================
// Storage Cloud from Dados sheet A19:D20
// ============================================================
const storageCloud = [
  { name: '01 TB', base_price: 199, min_tb: 1, max_tb: 100 },
];

const insertCloud = db.prepare(
  'INSERT INTO storage_cloud (name, base_price, min_tb, max_tb) VALUES (?, ?, ?, ?)'
);
for (const s of storageCloud) {
  insertCloud.run(s.name, s.base_price, s.min_tb, s.max_tb);
}
console.log(`  Inserted ${storageCloud.length} cloud storage entries`);

// ============================================================
// Margins from Dados sheet B25:D31
// ============================================================
const margins = [
  { type: 'sem_gerencia', aggressive: 0.25, moderate: 0.35, conservative: 0.45 },
  { type: 'com_gerencia', aggressive: 0.15, moderate: 0.25, conservative: 0.30 },
];

const insertMargin = db.prepare(
  'INSERT INTO margins (type, aggressive, moderate, conservative) VALUES (?, ?, ?, ?)'
);
for (const m of margins) {
  insertMargin.run(m.type, m.aggressive, m.moderate, m.conservative);
}
console.log(`  Inserted ${margins.length} margin entries`);

// ============================================================
// Server ROI from Dados sheet K13:N16
// ============================================================
const serverRoi = [
  { risk_level: 'Baixo', aggressive_months: 18, moderate_months: 17, conservative_months: 16 },
  { risk_level: 'Médio', aggressive_months: 17, moderate_months: 16, conservative_months: 15 },
  { risk_level: 'Alto', aggressive_months: 16, moderate_months: 15, conservative_months: 14 },
];

const insertRoi = db.prepare(
  'INSERT INTO server_roi (risk_level, aggressive_months, moderate_months, conservative_months) VALUES (?, ?, ?, ?)'
);
for (const r of serverRoi) {
  insertRoi.run(r.risk_level, r.aggressive_months, r.moderate_months, r.conservative_months);
}
console.log(`  Inserted ${serverRoi.length} server ROI entries`);

// ============================================================
// Management Multipliers from Dados sheet K19:N22
// ============================================================
const managementMultipliers = [
  { risk_level: 'Baixo', aggressive: 0.9, moderate: 1.1, conservative: 1.3 },
  { risk_level: 'Médio', aggressive: 1.0, moderate: 1.2, conservative: 1.4 },
  { risk_level: 'Alto', aggressive: 1.2, moderate: 1.4, conservative: 1.6 },
];

const insertMultiplier = db.prepare(
  'INSERT INTO management_multipliers (risk_level, aggressive, moderate, conservative) VALUES (?, ?, ?, ?)'
);
for (const m of managementMultipliers) {
  insertMultiplier.run(m.risk_level, m.aggressive, m.moderate, m.conservative);
}
console.log(`  Inserted ${managementMultipliers.length} management multiplier entries`);

// ============================================================
// Tax Config
// ============================================================
db.prepare('INSERT INTO tax_config (name, rate) VALUES (?, ?)').run('Carga tributária', 0.18);
console.log('  Inserted tax config');

// ============================================================
// Default Admin User
// ============================================================
const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!existingUser) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password_hash, name) VALUES (?, ?, ?)').run('admin', hash, 'Administrador');
  console.log('  Created default admin user (admin / admin123)');
}

console.log('\nDatabase seeded successfully!');
process.exit(0);
