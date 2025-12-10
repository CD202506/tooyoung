import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";

const dbPath = path.join(process.cwd(), "db", "tooyoung.db");

export function readOne(slug: string) {
  const db = new Database(dbPath);
  try {
    const row = db.prepare("SELECT * FROM cases_index WHERE slug = ?").get(slug);
    if (!row) return null;

    const casePath = path.join(process.cwd(), "data", "cases", `${row.id}.json`);
    let parsed: CaseRecord = {};

    if (fs.existsSync(casePath)) {
      const raw = fs.readFileSync(casePath, "utf-8");
      parsed = JSON.parse(raw);
    }

    const eventDatetime =
      parsed.event_datetime || row.event_datetime || parsed.event_date || "";
    const eventDate = eventDatetime ? eventDatetime.slice(0, 10) : "";
    const eventTime = eventDatetime ? eventDatetime.slice(11, 16) : "";

    const merged = {
      ...parsed,
      ...row,
    };

    return {
      case: normalizeCase({
        ...merged,
        title: merged.title || merged.title_zh || row.title_zh,
        event_date: eventDate,
        event_time: eventTime,
        content:
          merged.content ||
          merged.content_zh ||
          merged.full_story_zh ||
          merged.summary_zh ||
          merged.content_zh ||
          "",
      }),
    };
  } finally {
    db.close();
  }
}
