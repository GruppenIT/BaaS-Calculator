import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'baas.db');

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS veeam_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      edition TEXT NOT NULL,
      detail TEXT,
      type TEXT NOT NULL,
      points REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS points_intervals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interval_name TEXT UNIQUE NOT NULL,
      value_per_point REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS management_pricing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      charge_basis TEXT NOT NULL,
      setup_cost REAL NOT NULL,
      monthly_cost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS storage_onpremise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tb_amount INTEGER NOT NULL,
      monthly_cost REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS storage_cloud (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base_price REAL NOT NULL,
      min_tb REAL NOT NULL,
      max_tb REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS margins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      aggressive REAL NOT NULL,
      moderate REAL NOT NULL,
      conservative REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS server_roi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      risk_level TEXT NOT NULL UNIQUE,
      aggressive_months INTEGER NOT NULL,
      moderate_months INTEGER NOT NULL,
      conservative_months INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS management_multipliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      risk_level TEXT NOT NULL UNIQUE,
      aggressive REAL NOT NULL,
      moderate REAL NOT NULL,
      conservative REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tax_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      rate REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scenarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      client_name TEXT DEFAULT '',
      seller_name TEXT DEFAULT '',
      opportunity_number TEXT DEFAULT '',
      opportunity_name TEXT DEFAULT '',
      needs_veeam_licensing INTEGER DEFAULT 1,
      needs_managed_services INTEGER DEFAULT 1,
      needs_local_hardware INTEGER DEFAULT 0,
      needs_cloud_storage INTEGER DEFAULT 1,
      needs_o365_backup INTEGER DEFAULT 0,
      vm_count INTEGER DEFAULT 0,
      physical_server_count INTEGER DEFAULT 0,
      veeam_points_level TEXT DEFAULT '10k points',
      veeam_edition TEXT DEFAULT 'Veeam Backup & Replication ENT Plus',
      local_storage_tb REAL DEFAULT 0,
      cloud_storage_tb REAL DEFAULT 0,
      mailbox_count INTEGER DEFAULT 0,
      server_acquisition_cost REAL DEFAULT 0,
      has_dual_backup INTEGER DEFAULT 0,
      dollar_rate REAL DEFAULT 5.50,
      tax_rate REAL DEFAULT 0.18,
      results TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

export default db;
