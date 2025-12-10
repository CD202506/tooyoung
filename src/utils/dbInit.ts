import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

function ensureCaseProfilesTable(db: Database) {
  const now = new Date().toISOString();
  db.exec(`
    CREATE TABLE IF NOT EXISTS case_profiles (
      id INTEGER PRIMARY KEY,
      display_name TEXT NOT NULL,
      nickname TEXT,
      preferred_language TEXT,
      real_name TEXT,
      birth_year INTEGER,
      gender TEXT,
      privacy_level TEXT NOT NULL DEFAULT 'private',
      share_mode TEXT NOT NULL DEFAULT 'private',
      share_token TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_case_profiles_token ON case_profiles(share_token);
  `);

  const columns = db
    .prepare("PRAGMA table_info(case_profiles)")
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));

  if (!names.has("nickname")) {
    db.prepare("ALTER TABLE case_profiles ADD COLUMN nickname TEXT").run();
  }
  if (!names.has("preferred_language")) {
    db.prepare("ALTER TABLE case_profiles ADD COLUMN preferred_language TEXT").run();
  }
  if (!names.has("share_mode")) {
    db.prepare("ALTER TABLE case_profiles ADD COLUMN share_mode TEXT NOT NULL DEFAULT 'private'").run();
  }
  if (!names.has("share_token")) {
    db.prepare("ALTER TABLE case_profiles ADD COLUMN share_token TEXT").run();
  }

  const row = db.prepare("SELECT COUNT(*) as count FROM case_profiles").get() as { count: number };
  if (row.count === 0) {
    db.prepare(
      `
      INSERT INTO case_profiles (
        id,
        display_name,
        nickname,
        preferred_language,
        real_name,
        birth_year,
        gender,
        share_mode,
        privacy_level,
        share_token,
        created_at,
        updated_at
      ) VALUES (
        1,
        'Default Case',
        'Default',
        'zh',
        NULL,
        NULL,
        NULL,
        'private',
        'private',
        NULL,
        @now,
        @now
      )
    `,
    ).run({ now });
  }
}

function ensureCasesTableCaseId(db: Database) {
  const tableExists = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='cases_index'",
    )
    .get();
  if (!tableExists) return;

  const hasCaseId = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'",
    )
    .get();
  if (!hasCaseId) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
  }
}

/**
 * Apply SQL migrations in order to the SQLite database.
 * Note: requires a runtime dependency like `better-sqlite3` to be available.
 */
export function applyMigrations() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
  const Database = require("better-sqlite3");

  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  const migrationsDir = path.join(process.cwd(), "db", "migrations");

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.toLowerCase().endsWith(".sql"))
    .sort();

  const db = new Database(dbPath);
  try {
    for (const file of migrationFiles) {
      const migrationSql = fs.readFileSync(
        path.join(migrationsDir, file),
        "utf8",
      );
      db.exec(migrationSql);
    }

    ensureCaseProfilesTable(db);
    ensureCasesTableCaseId(db);
  } finally {
    db.close();
  }

  console.log("SQLite migrations applied");
}
