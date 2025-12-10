import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

type CaseContent = {
  id?: string;
  slug?: string;
  case_id?: number;
  event_datetime?: string;
  title?: { zh?: string | null; en?: string | null } | string;
  title_zh?: string;
  short_sentence?: { zh?: string | null; en?: string | null } | string;
  short_sentence_zh?: string;
  summary?: { zh?: string | null; en?: string | null } | string;
  summary_zh?: string;
  full_story?: { zh?: string | null; en?: string | null } | string;
  full_story_zh?: string;
  content?: { zh?: string | null; en?: string | null } | string;
  content_zh?: string;
  tags?: string[];
  photos?: { filename?: string; file?: string; caption?: string }[];
  visibility?: string;
  public_excerpt_zh?: string;
  symptom_categories?: string[];
};

/**
 * Sync case JSON files into SQLite tables:
 * cases_index, tags_index, and cases_fts.
 */
export function syncCasesToSQLite() {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  const casesDir = path.join(process.cwd(), "data", "cases");

  if (!fs.existsSync(casesDir)) {
    console.warn(`Cases directory not found: ${casesDir}`);
    return;
  }

  const files = fs
    .readdirSync(casesDir)
    .filter((file) => file.toLowerCase().endsWith(".json"));

  if (files.length === 0) {
    console.log("No case files to sync.");
    return;
  }

  const db = new Database(dbPath);

  const hasVisibilityColumn = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'visibility'",
    )
    .get();
  if (!hasVisibilityColumn) {
    db.prepare(
      "ALTER TABLE cases_index ADD COLUMN visibility TEXT DEFAULT 'private'",
    ).run();
  }
  const hasExcerptColumn = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'public_excerpt_zh'",
    )
    .get();
  if (!hasExcerptColumn) {
    db.prepare(
      "ALTER TABLE cases_index ADD COLUMN public_excerpt_zh TEXT",
    ).run();
  }
  const hasSymptomColumn = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'symptom_categories'",
    )
    .get();
  if (!hasSymptomColumn) {
    db.prepare(
      "ALTER TABLE cases_index ADD COLUMN symptom_categories TEXT",
    ).run();
  }
  const hasCaseIdColumn = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'",
    )
    .get();
  if (!hasCaseIdColumn) {
    db.prepare(
      "ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1",
    ).run();
  }

  const upsertCaseStmt = db.prepare(`
    INSERT INTO cases_index (
      id,
      slug,
      case_id,
      event_datetime,
      short_sentence_zh,
      summary_zh,
      title_zh,
      content_zh,
      public_excerpt_zh,
      symptom_categories,
      visibility,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @slug,
      @case_id,
      @event_datetime,
      @short_sentence_zh,
      @summary_zh,
      @title_zh,
      @content_zh,
      @public_excerpt_zh,
      @symptom_categories,
      @visibility,
      @created_at,
      @updated_at
    )
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      event_datetime = excluded.event_datetime,
      short_sentence_zh = excluded.short_sentence_zh,
      summary_zh = excluded.summary_zh,
      title_zh = excluded.title_zh,
      content_zh = excluded.content_zh,
      public_excerpt_zh = excluded.public_excerpt_zh,
      symptom_categories = excluded.symptom_categories,
      visibility = excluded.visibility,
      case_id = excluded.case_id,
      updated_at = excluded.updated_at
  `);

  const deleteTagsStmt = db.prepare(
    "DELETE FROM tags_index WHERE case_id = ?",
  );
  const insertTagStmt = db.prepare(
    "INSERT INTO tags_index (case_id, tag) VALUES (?, ?)",
  );

  const replaceFtsStmt = db.prepare(`
    INSERT INTO cases_fts (
      id,
      title_zh,
      short_sentence_zh,
      summary_zh,
      content_zh
    ) VALUES (?, ?, ?, ?, ?)
  `);
  const deleteFtsStmt = db.prepare("DELETE FROM cases_fts WHERE id = ?");

  const nowIso = () => new Date().toISOString();

  const transaction = db.transaction(() => {
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(casesDir, file), "utf8");
        const parsed = JSON.parse(raw) as CaseContent;

        // Skip placeholder/template cases.
        if (
          !parsed.id ||
          parsed.id.includes("YYYY")
        ) {
          continue;
        }

        const id = parsed.id;
        const slug = parsed.slug ?? "";
        const case_id =
          typeof parsed.case_id === "number" && Number.isFinite(parsed.case_id)
            ? parsed.case_id
            : 1;
        const event_datetime = parsed.event_datetime ?? "";

        const title =
          typeof parsed.title === "object"
            ? parsed.title?.zh ?? parsed.title?.en ?? parsed.title_zh ?? ""
            : parsed.title ?? parsed.title_zh ?? "";

        const short_sentence =
          typeof parsed.short_sentence === "object"
            ? parsed.short_sentence?.zh ??
              parsed.short_sentence?.en ??
              parsed.short_sentence_zh ??
              ""
            : parsed.short_sentence ?? parsed.short_sentence_zh ?? "";

        const summary =
          typeof parsed.summary === "object"
            ? parsed.summary?.zh ??
              parsed.summary?.en ??
              parsed.summary_zh ??
              ""
            : parsed.summary ?? parsed.summary_zh ?? "";

        const content =
          typeof parsed.full_story === "object"
            ? parsed.full_story?.zh ??
              parsed.full_story?.en ??
              parsed.full_story_zh ??
              parsed.content_zh ??
              ""
            : parsed.full_story ??
              parsed.full_story_zh ??
              parsed.content_zh ??
              parsed.content ??
              "";

        const tags = Array.isArray(parsed.tags) ? parsed.tags : [];
        const visibility = parsed.visibility || "private";
        const public_excerpt_zh = parsed.public_excerpt_zh ?? null;
        const symptom_categories = Array.isArray(parsed.symptom_categories)
          ? parsed.symptom_categories
          : [];

        const record = {
          id,
          slug,
          event_datetime,
          case_id,
          short_sentence_zh: short_sentence,
          summary_zh: summary,
          title_zh: title,
          content_zh: content,
          public_excerpt_zh,
          symptom_categories: JSON.stringify(symptom_categories),
          created_at: nowIso(),
          updated_at: nowIso(),
          visibility,
        };

        upsertCaseStmt.run(record);

        deleteTagsStmt.run(id);
        if (Array.isArray(tags)) {
          for (const tag of tags) {
            insertTagStmt.run(id, tag);
          }
        }

        deleteFtsStmt.run(id);
        replaceFtsStmt.run(
          id,
          record.title_zh,
          record.short_sentence_zh,
          record.summary_zh,
          record.content_zh,
        );
      } catch (err) {
        console.error(`Failed to sync file ${file}:`, err);
      }
    }
  });

  transaction();
  db.close();

  console.log("Sync completed.");
}

syncCasesToSQLite();
