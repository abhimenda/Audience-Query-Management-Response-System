const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'database.sqlite');

let db = null;

function initDatabase() {
  // Create database file if it doesn't exist
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '');
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to SQLite database');
      createTables();
    }
  });
}

function createTables() {
  // Queries table
  db.run(`CREATE TABLE IF NOT EXISTS queries (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_email TEXT,
    subject TEXT,
    content TEXT NOT NULL,
    tags TEXT DEFAULT '[]',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'new',
    assigned_to TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    response_time INTEGER
  )`);

  // Assignments table (for tracking assignment history)
  db.run(`CREATE TABLE IF NOT EXISTS assignments (
    id TEXT PRIMARY KEY,
    query_id TEXT NOT NULL,
    assigned_to TEXT NOT NULL,
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (query_id) REFERENCES queries(id)
  )`);

  // Status history table
  db.run(`CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    query_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (query_id) REFERENCES queries(id)
  )`);

  // Teams table (for routing)
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default teams
  db.run(`INSERT OR IGNORE INTO teams (id, name, email) VALUES 
    ('team-1', 'Support Team', 'support@company.com'),
    ('team-2', 'Sales Team', 'sales@company.com'),
    ('team-3', 'Technical Team', 'tech@company.com')`);
}

function getDatabase() {
  return db;
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase
};

