import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { CaseListPage, CaseListItem } from "@/components/CaseListPage";
import { normalizeCase } from "@/lib/normalizeCase";
import { CaseRecord } from "@/types/case";

type SearchParams = {
  case_id?: string;
};

function getEvents(caseId: number): CaseListItem[] {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  const db = new Database(dbPath);
  try {
    const hasTags = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'tags'")
      .get();
    if (!hasTags) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN tags TEXT").run();
    }
    const hasSymptoms = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'symptom_categories'")
      .get();
    if (!hasSymptoms) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN symptom_categories TEXT").run();
    }

    const rows = db
      .prepare(
        `
        SELECT
          ci.id,
          ci.slug,
          ci.event_datetime,
          ci.title_zh,
          ci.summary_zh,
          ci.symptom_categories,
          GROUP_CONCAT(t.tag, '||') AS tags
        FROM cases_index ci
        LEFT JOIN tags_index t ON ci.id = t.case_id
        WHERE ci.case_id = @caseId
        GROUP BY ci.id
        ORDER BY ci.event_datetime DESC
      `,
      )
      .all({ caseId }) as Array<{
        id: string;
        slug: string;
        event_datetime: string | null;
        title_zh: string | null;
        summary_zh: string | null;
        symptom_categories?: string | null;
        tags?: string | null;
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
        } catch (err) {
          console.warn("failed to read case file", row.id, err);
        }
      }
      const normalized = normalizeCase(merged);
      return {
        slug: normalized.slug,
        title:
          typeof normalized.title === "string"
            ? normalized.title
            : normalized.title?.zh ?? normalized.title?.en ?? normalized.title_zh,
        summary:
          typeof normalized.summary === "string"
            ? normalized.summary
            : normalized.summary?.zh ?? normalized.summary?.en ?? normalized.summary_zh,
        event_datetime: normalized.event_datetime ?? null,
        tags: row.tags
          ? row.tags
              .split("||")
              .map((t) => t.trim())
              .filter(Boolean)
          : normalized.tags ?? [],
        symptom_categories: (() => {
          if (Array.isArray(normalized.symptom_categories)) return normalized.symptom_categories;
          if (row.symptom_categories) {
            try {
              const parsed = JSON.parse(row.symptom_categories) as unknown;
              if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
            } catch (err) {
              console.warn("parse symptom_categories failed", err);
            }
          }
          return [];
        })(),
      } satisfies CaseListItem;
    });
  } finally {
    db.close();
  }
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const caseId = Number(searchParams?.case_id) || 1;
  const events = getEvents(caseId);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <CaseListPage events={events} />
      </div>
    </main>
  );
}
