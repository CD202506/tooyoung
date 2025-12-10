import { NextResponse } from "next/server";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment
    // @ts-expect-error: runtime dependency expected to be installed separately.
    const Database = require("better-sqlite3");
    const db = new Database("db/tooyoung.db");

    const rows = db
      .prepare(
        `
        SELECT
          slug,
          short_sentence_zh,
          event_datetime
        FROM cases_index
        ORDER BY event_datetime DESC
        LIMIT 5
      `,
      )
      .all() as {
      slug: string;
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
