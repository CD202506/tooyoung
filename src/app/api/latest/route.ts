import { NextResponse } from "next/server";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    const Database = require("better-sqlite3");
    const db = new Database("db/tooyoung.db");

    const hasCaseId = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'")
      .get();
    if (!hasCaseId) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
    }
    const hasShareMode = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'share_mode'")
      .get();
    if (!hasShareMode) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN share_mode TEXT DEFAULT 'private'").run();
    }

    const rows = db
      .prepare(
        `
        SELECT
          slug,
          case_id,
          share_mode,
          share_token,
          short_sentence_zh,
          event_datetime
        FROM cases_index
        WHERE COALESCE(share_mode, 'private') != 'private'
        ORDER BY event_datetime DESC
        LIMIT 5
      `,
      )
      .all() as {
      slug: string;
      case_id: number | null;
      share_mode: string | null;
      share_token: string | null;
      short_sentence_zh: string | null;
      event_datetime: string;
    }[];

    db.close();
    return NextResponse.json({ latest: rows });
  } catch (error) {
    console.error("Failed to fetch latest cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest cases" },
      { status: 500 },
    );
  }
}
