import fs from "node:fs";
import path from "node:path";
import type Database from "better-sqlite3";

function ensureCaseProfilesTable(db: Database) {
  const now = new Date().toISOString();
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='case_profiles'")
    .get();

  if (!tableExists) {
    db.exec(`
      CREATE TABLE case_profiles (
        id INTEGER PRIMARY KEY,
        display_name TEXT,
        nickname TEXT,
        preferred_language TEXT DEFAULT 'zh',
        real_name TEXT,
        birth_year INTEGER,
        gender TEXT,
        privacy_level TEXT NOT NULL DEFAULT 'private',
        privacy_mode TEXT NOT NULL DEFAULT 'private',
        share_mode TEXT DEFAULT 'private',
        share_token TEXT,
        created_at TEXT,
        updated_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_case_profiles_token ON case_profiles(share_token);
    `);
  } else {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_case_profiles_token ON case_profiles(share_token);
    `);
  }

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
  if (!names.has("privacy_mode")) {
    db.prepare("ALTER TABLE case_profiles ADD COLUMN privacy_mode TEXT NOT NULL DEFAULT 'private'").run();
  }

  const hasDefaultProfile = db
    .prepare("SELECT 1 FROM case_profiles WHERE id = 1")
    .get() as { 1: number } | undefined;
  if (!hasDefaultProfile) {
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
        privacy_mode,
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

function ensureCasesIndexColumns(db: Database) {
  const columns = db
    .prepare("PRAGMA table_info('cases_index')")
    .all() as { name: string }[];
  const names = new Set(columns.map((c) => c.name));

  if (!names.has("case_id")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
  }
  if (!names.has("images")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN images TEXT").run();
  }
  if (!names.has("tags")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN tags TEXT").run();
  }
  if (!names.has("symptom_categories")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN symptom_categories TEXT DEFAULT '[]'").run();
  }
  if (!names.has("share_mode")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN share_mode TEXT DEFAULT 'private'").run();
  }
  if (!names.has("share_token")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN share_token TEXT").run();
  }
  if (!names.has("emotion")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN emotion TEXT").run();
  }
  if (!names.has("severity")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN severity INTEGER DEFAULT 0").run();
  }
  if (!names.has("ai_summary")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_summary TEXT").run();
  }
  if (!names.has("ai_risk")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_risk TEXT").run();
  }
  if (!names.has("ai_care_advice")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_care_advice TEXT").run();
  }
  if (!names.has("ai_keywords")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_keywords TEXT").run();
  }
  if (!names.has("ai_score")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_score INTEGER").run();
  }
  if (!names.has("ai_symptom_shift")) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_symptom_shift TEXT").run();
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
    ensureCasesIndexColumns(db);
  } finally {
    db.close();
  }

  console.log("SQLite migrations applied");
}
