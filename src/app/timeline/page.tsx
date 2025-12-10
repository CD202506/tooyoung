import Database from "better-sqlite3";
import { TimelineClient, TimelineEvent } from "./TimelineClient";
import { normalizeCase } from "@/lib/normalizeCase";

function loadEvents(): TimelineEvent[] {
  const db = new Database("db/tooyoung.db");
  const rows = db
    .prepare(
      `
      SELECT
        id,
        slug,
        event_datetime,
      title_zh,
      summary_zh,
      short_sentence_zh,
      visibility,
      tags
    FROM cases_index
    LEFT JOIN tags_index ti ON cases_index.id = ti.case_id
    WHERE event_datetime IS NOT NULL
    ORDER BY event_datetime DESC
    `,
    )
    .all() as {
      id: string;
      slug: string;
      event_datetime: string;
      title_zh: string | null;
      summary_zh: string | null;
      short_sentence_zh: string | null;
      visibility?: string | null;
      tags?: string | null;
    }[];

  db.close();

  return rows.map((row) => {
    const normalized = normalizeCase({
      ...row,
      summary_zh: row.summary_zh ?? row.short_sentence_zh ?? "",
      title_zh: row.title_zh ?? "",
      tags: row.tags ? row.tags.split(",") : undefined,
    });
    return {
      id: normalized.id || row.id,
      slug: normalized.slug || row.slug,
      event_datetime: normalized.event_datetime || row.event_datetime,
      title_zh: normalized.title_zh || "",
      summary_zh: normalized.summary_zh || normalized.short_sentence_zh || "",
      visibility: normalized.visibility,
      tags: normalized.tags,
    };
  });
}

export default function TimelinePage() {
  const events = loadEvents();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-neutral-50">
      <header className="mb-6">
        <h1 className="text-3xl font-bold leading-tight">事件時間軸</h1>
        <p className="mt-2 text-sm text-neutral-300">
          依日期排列的事件紀錄，可使用月份與分類（預留）進行篩選。
        </p>
      </header>

      <TimelineClient events={events} />
    </main>
  );
}
