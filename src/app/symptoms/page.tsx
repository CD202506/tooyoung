export const dynamic = "force-dynamic";
export const revalidate = 0;

import { SymptomOverviewPage, SymptomEvent } from "@/components/SymptomOverviewPage";

type SearchParams = {
  case_id?: string;
};

async function getEvents(caseId: number): Promise<SymptomEvent[]> {
  if (process.env.NEXT_PHASE === "phase-production-build") return [];

  const path = await import("node:path");
  const { default: Database } = await import("better-sqlite3");
  const dbPath = path.default.join(process.cwd(), "db", "tooyoung.db");
  const db = new Database(dbPath);
  try {
    const hasSymptoms = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'symptom_categories'")
      .get();
    if (!hasSymptoms) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN symptom_categories TEXT").run();
    }

    const rows = db
      .prepare(
        `
        SELECT symptom_categories
        FROM cases_index
        WHERE case_id = @caseId
      `,
      )
      .all({ caseId }) as Array<{ symptom_categories?: string | null }>;

    return rows.map((row) => {
      let symptom_categories: string[] = [];
      if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories) as unknown;
          if (Array.isArray(parsed)) {
            symptom_categories = parsed.filter((v): v is string => typeof v === "string");
          }
        } catch (err) {
          console.warn("parse symptom_categories failed", err);
        }
      }
      return { symptom_categories };
    });
  } finally {
    db.close();
  }
}

export default async function SymptomsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const caseId = Number(searchParams?.case_id) || 1;
  const events = await getEvents(caseId);

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 lg:px-8">
        <SymptomOverviewPage events={events} />
      </div>
    </main>
  );
}
