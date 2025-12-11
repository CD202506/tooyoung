import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json({ query: q, results: [] });
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const Database = require("better-sqlite3");
    const db = new Database("db/tooyoung.db");

    const hasCaseId = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'")
      .get();
    if (!hasCaseId) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
    }

    const matchedIds = db
      .prepare(
        `
        SELECT id
        FROM cases_fts
        WHERE cases_fts MATCH ?
        LIMIT 50
      `,
      )
      .all(q) as { id: string }[];

    if (matchedIds.length === 0) {
      db.close();
      return NextResponse.json({ query: q, results: [] });
    }

    const ids = matchedIds.map((row) => row.id);
    const placeholders = ids.map(() => "?").join(", ");

    const rows = db
      .prepare(
        `
        SELECT
          id,
          slug,
          case_id,
          title_zh,
          short_sentence_zh,
          summary_zh
        FROM cases_index
        WHERE id IN (${placeholders})
      `,
      )
      .all(...ids) as {
      id: string;
      slug: string;
      case_id: number | null;
      title_zh: string | null;
      short_sentence_zh: string | null;
      summary_zh: string | null;
    }[];

    db.close();
    return NextResponse.json({ query: q, results: rows });
  } catch (error) {
    console.error("Failed to search cases:", error);
    return NextResponse.json(
      { error: "Failed to search cases" },
      { status: 500 },
    );
  }
}
