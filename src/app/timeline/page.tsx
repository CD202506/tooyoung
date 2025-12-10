import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { TimelinePage, TimelineEvent } from "@/components/TimelinePage";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";

function loadEvents(caseId: number): TimelineEvent[] {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  const db = new Database(dbPath);
  try {
    const rows = db
      .prepare(
        `
        SELECT id, slug, event_datetime, title_zh, summary_zh, symptom_categories
        FROM cases_index
        WHERE case_id = @caseId
        ORDER BY event_datetime DESC
      `,
      )
      .all({ caseId }) as Array<{
        id: string;
        slug: string;
        event_datetime: string | null;
        title_zh: string | null;
        summary_zh: string | null;
        symptom_categories?: string | null;
      }>;

    return rows.map((row) => {
      const casePath = path.join(process.cwd(), "data", "cases", `${row.id}.json`);
      let merged: CaseRecord = {
        id: row.id,
        slug: row.slug,
        event_datetime: row.event_datetime ?? undefined,
        title_zh: row.title_zh ?? undefined,
        summary_zh: row.summary_zh ?? undefined,
      };
      if (fs.existsSync(casePath)) {
        try {
          const raw = fs.readFileSync(casePath, "utf-8");
          const json = JSON.parse(raw) as CaseRecord;
          merged = { ...merged, ...json };
        } catch (error) {
          console.warn("failed to read case file", row.id, error);
        }
      }
      const normalized = normalizeCase(merged);
      let symptom_categories: string[] = [];
      if (Array.isArray(normalized.symptom_categories)) {
        symptom_categories = normalized.symptom_categories;
      } else if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories) as unknown;
          if (Array.isArray(parsed)) {
            symptom_categories = parsed.filter((v): v is string => typeof v === "string");
          }
        } catch (error) {
          console.warn("parse symptom_categories failed", error);
        }
      }

      return {
        slug: normalized.slug,
        event_datetime: normalized.event_datetime ?? null,
        title:
          typeof normalized.title === "string"
            ? normalized.title
            : normalized.title?.zh ?? normalized.title?.en ?? normalized.title_zh,
        summary:
          typeof normalized.summary === "string"
            ? normalized.summary
            : normalized.summary?.zh ?? normalized.summary?.en ?? normalized.summary_zh,
        symptom_categories,
      } satisfies TimelineEvent;
    });
  } finally {
    db.close();
  }
}

export default async function Timeline() {
  const caseId = 1; // 可改為從 searchParams 讀取，需求未指定
  const events = loadEvents(caseId);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <TimelinePage events={events} />
      </div>
    </main>
  );
}
