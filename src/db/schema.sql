-- V0 DB-aligned schema (SQLite)

CREATE TABLE IF NOT EXISTS case_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS case_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  severity INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES case_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_symptoms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT,
  severity INTEGER NOT NULL DEFAULT 0,
  last_observed TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (case_id) REFERENCES case_profiles(id) ON DELETE CASCADE
);
