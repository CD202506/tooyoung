import path from "node:path";
import Database from "better-sqlite3";

type PrivacyLevel = "private" | "limited" | "public";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");

export type ShareAccessResult =
  | { allowed: false; reason: "not_found" | "forbidden" }
  | {
      allowed: true;
      privacy: PrivacyLevel;
      profile: { display_name: string };
      events: Array<Record<string, unknown>>;
      metrics?: Record<string, unknown>;
    };

function getDb() {
  return new Database(DB_PATH);
}

function parseSymptomCategories(value: unknown): string[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  return [];
}

export async function validateShareAccess(token: string): Promise<ShareAccessResult> {
  if (!token || token.trim().length === 0) return { allowed: false, reason: "not_found" };

  const db = getDb();
  try {
    const profile = db
      .prepare(
        "SELECT id, display_name, privacy_level, share_token FROM case_profiles WHERE share_token = ?",
      )
      .get(token) as
      | {
          id: number;
          display_name: string;
          privacy_level: PrivacyLevel;
          share_token: string | null;
        }
      | undefined;

    if (!profile || !profile.share_token) {
      return { allowed: false, reason: "not_found" };
    }

    if (profile.privacy_level === "private") {
      return { allowed: false, reason: "forbidden" };
    }

    // Build events per privacy level
    if (profile.privacy_level === "limited") {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const cutoff = since.toISOString();
      const rows = db
        .prepare(
          `
          SELECT event_datetime, title_zh, short_sentence_zh
          FROM cases_index
          WHERE case_id = ? AND event_datetime >= ?
          ORDER BY event_datetime DESC
        `,
        )
        .all(profile.id, cutoff) as Array<{
          event_datetime: string | null;
          title_zh: string | null;
          short_sentence_zh: string | null;
        }>;

      const events = rows.map((row) => ({
        event_datetime: row.event_datetime,
        title_zh: row.title_zh,
        short_sentence_zh: row.short_sentence_zh,
      }));

      return {
        allowed: true,
        privacy: "limited",
        profile: { display_name: profile.display_name },
        events,
        metrics: {},
      };
    }

    // public
    const rows = db
      .prepare(
        `
        SELECT id, event_datetime, title_zh, summary_zh, symptom_categories
        FROM cases_index
        WHERE case_id = ?
        ORDER BY event_datetime DESC
      `,
      )
      .all(profile.id) as Array<{
        id: string;
        event_datetime: string | null;
        title_zh: string | null;
        summary_zh: string | null;
        symptom_categories: string | null;
      }>;

    const tagsRows = db
      .prepare(
        `
        SELECT case_id, tag
        FROM tags_index
      `,
      )
      .all() as Array<{ case_id: string; tag: string }>;

    const tagMap = new Map<string, string[]>();
    tagsRows.forEach((row) => {
      if (!tagMap.has(row.case_id)) {
        tagMap.set(row.case_id, []);
      }
      tagMap.get(row.case_id)!.push(row.tag);
    });

    const events = rows.map((row) => ({
      event_datetime: row.event_datetime,
      title_zh: row.title_zh,
      summary_zh: row.summary_zh,
      tags: tagMap.get(row.id) ?? [],
      symptom_categories: parseSymptomCategories(row.symptom_categories),
    }));

    return {
      allowed: true,
      privacy: "public",
      profile: { display_name: profile.display_name },
      events,
    };
  } finally {
    db.close();
  }
}
