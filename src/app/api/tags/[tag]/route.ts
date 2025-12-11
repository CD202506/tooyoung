import { NextRequest, NextResponse } from "next/server";

type Params = { tag: string };

export async function GET(
  _req: NextRequest,
  context: any,
) {
  try {
    const params = context?.params as Params | Promise<Params>;
    const tag =
      params && typeof (params as Promise<Params>).then === "function"
        ? (await params).tag
        : (params as Params | undefined)?.tag;
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const Database = require("better-sqlite3");
    const db = new Database("db/tooyoung.db");

    const hasCaseId = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'")
      .get();
    if (!hasCaseId) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
    }

    const caseIds = db
      .prepare(
        `
        SELECT case_id
        FROM tags_index
        WHERE tag = ?
      `,
      )
      .all(tag) as { case_id: string }[];

    if (caseIds.length === 0) {
      db.close();
      return NextResponse.json({ tag, cases: [] });
    }

    const ids = caseIds.map((row) => row.case_id);
    const placeholders = ids.map(() => "?").join(", ");

    const rows = db
      .prepare(
        `
        SELECT
          id,
          slug,
          case_id,
          event_datetime,
          title_zh,
          short_sentence_zh,
          summary_zh
        FROM cases_index
        WHERE id IN (${placeholders})
        ORDER BY event_datetime DESC
      `,
      )
      .all(...ids) as {
      id: string;
      slug: string;
      case_id: number | null;
      event_datetime: string;
      title_zh: string | null;
      short_sentence_zh: string | null;
      summary_zh: string | null;
    }[];

    db.close();
    return NextResponse.json({ tag, cases: rows });
  } catch (error) {
    console.error("Failed to fetch cases by tag:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases by tag" },
      { status: 500 },
    );
  }
}
