const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = process.env.DB_PATH || './data/blp.db';
const resolvedPath = path.resolve(__dirname, dbPath);

// Make sure the folder for the database file exists
fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');

// ---- Schema ----
db.exec(`
CREATE TABLE IF NOT EXISTS members (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  member_id     TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  city          TEXT,
  role          TEXT DEFAULT 'Supporter',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS desk_submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  type          TEXT NOT NULL DEFAULT 'Problem',
  message       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT UNIQUE NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_desk_created_at ON desk_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
`);

module.exports = db;
