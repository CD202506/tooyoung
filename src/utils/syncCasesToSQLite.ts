import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

type CaseContent = {
  id?: string;
  slug?: string;
  case_id?: number;
  emotion?: string;
  severity?: number;
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
  const addedColumns: string[] = [];

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
    addedColumns.push("symptom_categories");
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
    addedColumns.push("case_id");
  }
  const hasImagesColumn = db
    .prepare(
      "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'images'",
    )
    .get();
  if (!hasImagesColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN images TEXT").run();
    addedColumns.push("images");
  }
  const hasTagsColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'tags'")
    .get();
  if (!hasTagsColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN tags TEXT").run();
    addedColumns.push("tags");
  }
  const hasShareModeColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'share_mode'")
    .get();
  if (!hasShareModeColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN share_mode TEXT DEFAULT 'private'").run();
    addedColumns.push("share_mode");
  }
  const hasShareTokenColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'share_token'")
    .get();
  if (!hasShareTokenColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN share_token TEXT").run();
    addedColumns.push("share_token");
  }
  const hasEmotionColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'emotion'")
    .get();
  if (!hasEmotionColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN emotion TEXT").run();
    addedColumns.push("emotion");
  }
  const hasSeverityColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'severity'")
    .get();
  if (!hasSeverityColumn) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN severity INTEGER DEFAULT 0").run();
    addedColumns.push("severity");
  }
  const hasAiSummary = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_summary'")
    .get();
  if (!hasAiSummary) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_summary TEXT").run();
    addedColumns.push("ai_summary");
  }
  const hasAiRisk = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_risk'")
    .get();
  if (!hasAiRisk) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_risk TEXT").run();
    addedColumns.push("ai_risk");
  }
  const hasAiCare = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_care_advice'")
    .get();
  if (!hasAiCare) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_care_advice TEXT").run();
    addedColumns.push("ai_care_advice");
  }
  const hasAiKeywords = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_keywords'")
    .get();
  if (!hasAiKeywords) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_keywords TEXT").run();
    addedColumns.push("ai_keywords");
  }
  const hasAiScore = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_score'")
    .get();
  if (!hasAiScore) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_score INTEGER").run();
    addedColumns.push("ai_score");
  }
  const hasAiShift = db
    .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'ai_symptom_shift'")
    .get();
  if (!hasAiShift) {
    db.prepare("ALTER TABLE cases_index ADD COLUMN ai_symptom_shift TEXT").run();
    addedColumns.push("ai_symptom_shift");
  }

  const upsertCaseStmt = db.prepare(`
    INSERT INTO cases_index (
      id,
      slug,
      case_id,
      event_datetime,
      emotion,
      severity,
      ai_summary,
      ai_risk,
      ai_care_advice,
      ai_keywords,
      ai_score,
      ai_symptom_shift,
      short_sentence_zh,
      summary_zh,
      title_zh,
      content_zh,
      public_excerpt_zh,
      symptom_categories,
      images,
      tags,
      share_mode,
      share_token,
      visibility,
      created_at,
      updated_at
    ) VALUES (
      @id,
      @slug,
      @case_id,
      @event_datetime,
      @emotion,
      @severity,
      @ai_summary,
      @ai_risk,
      @ai_care_advice,
      @ai_keywords,
      @ai_score,
      @ai_symptom_shift,
      @short_sentence_zh,
      @summary_zh,
      @title_zh,
      @content_zh,
      @public_excerpt_zh,
      @symptom_categories,
      @images,
      @tags,
      @share_mode,
      @share_token,
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
      images = excluded.images,
      tags = excluded.tags,
      share_mode = excluded.share_mode,
      share_token = excluded.share_token,
      emotion = excluded.emotion,
      severity = excluded.severity,
      ai_summary = excluded.ai_summary,
      ai_risk = excluded.ai_risk,
      ai_care_advice = excluded.ai_care_advice,
      ai_keywords = excluded.ai_keywords,
      ai_score = excluded.ai_score,
      ai_symptom_shift = excluded.ai_symptom_shift,
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
        const images = Array.isArray(parsed.photos)
          ? parsed.photos
              .map((p) => {
                if (typeof p === "string") return p;
                if (p && typeof p === "object") {
                  const file = (p as { file?: string }).file;
                  if (typeof file === "string") return file;
                }
                return null;
              })
              .filter((p): p is string => typeof p === "string")
          : [];
        const visibility = parsed.visibility || "private";
        const public_excerpt_zh = parsed.public_excerpt_zh ?? null;
        const symptom_categories = Array.isArray(parsed.symptom_categories)
          ? parsed.symptom_categories
          : [];
        const share_mode =
          parsed && typeof parsed === "object" && "share_mode" in parsed
            ? ((parsed as { share_mode?: string }).share_mode as string | undefined) ?? "private"
            : "private";
        const share_token =
          parsed && typeof parsed === "object" && "share_token" in parsed
            ? ((parsed as { share_token?: string | null }).share_token ?? null)
            : null;
        const emotion =
          parsed && typeof parsed === "object" && "emotion" in parsed
            ? ((parsed as { emotion?: string }).emotion ?? null)
            : null;
        const severity =
          parsed && typeof parsed === "object" && "severity" in parsed
            ? Number((parsed as { severity?: number }).severity) || 0
            : 0;
        const ai_summary =
          parsed && typeof parsed === "object" && "ai_summary" in parsed
            ? ((parsed as { ai_summary?: string | null }).ai_summary ?? null)
            : null;
        const ai_risk =
          parsed && typeof parsed === "object" && "ai_risk" in parsed
            ? ((parsed as { ai_risk?: string | null }).ai_risk ?? null)
            : null;
        const ai_care_advice =
          parsed && typeof parsed === "object" && "ai_care_advice" in parsed
            ? ((parsed as { ai_care_advice?: string | null }).ai_care_advice ?? null)
            : null;
        const ai_keywords =
          parsed && typeof parsed === "object" && "ai_keywords" in parsed
            ? (Array.isArray((parsed as { ai_keywords?: unknown }).ai_keywords)
                ? (parsed as { ai_keywords?: string[] }).ai_keywords
                : [])
            : [];
        const ai_score =
          parsed && typeof parsed === "object" && "ai_score" in parsed
            ? Number((parsed as { ai_score?: number }).ai_score) || 0
            : 0;
        const ai_symptom_shift =
          parsed && typeof parsed === "object" && "ai_symptom_shift" in parsed
            ? ((parsed as { ai_symptom_shift?: string | null }).ai_symptom_shift ?? null)
            : null;

        const record = {
          id,
          slug,
          event_datetime,
          case_id,
          emotion,
          severity,
          ai_summary,
          ai_risk,
          ai_care_advice,
          ai_keywords: JSON.stringify(ai_keywords ?? []),
          ai_score,
          ai_symptom_shift,
          short_sentence_zh: short_sentence,
          summary_zh: summary,
          title_zh: title,
          content_zh: content,
          public_excerpt_zh,
          symptom_categories: JSON.stringify(symptom_categories),
          images: JSON.stringify(images),
          tags: JSON.stringify(tags),
          share_mode,
          share_token,
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

  if (addedColumns.length > 0) {
    console.log(`Sync completed. Added columns: ${addedColumns.join(", ")}`);
  } else {
    console.log("Sync completed. No new columns added.");
  }
}

syncCasesToSQLite();
