import { NextResponse } from "next/server";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import Database from "better-sqlite3";

type CaseRow = {
  id: string;
  slug: string;
  event_datetime: string;
  title_zh: string | null;
  short_sentence_zh: string | null;
  summary_zh: string | null;
  symptom_categories?: string | null;
  tags?: string | null;
  visibility?: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limitValue =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.max(1, Number(limitParam))
        : null;

    const db = new Database("db/tooyoung.db");

    const hasVisibilityColumn = db
      .prepare(
        "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'visibility'",
      )
      .get();
    if (!hasVisibilityColumn) {
      db.prepare(
        "ALTER TABLE cases_index ADD COLUMN visibility TEXT DEFAULT 'private'",
      ).run();
    }

    const hasSymptomColumn = db
      .prepare(
        "SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'symptom_categories'",
      )
      .get();
    if (!hasSymptomColumn) {
      db.prepare(
        "ALTER TABLE cases_index ADD COLUMN symptom_categories TEXT",
      ).run();
    }

    const baseSql = `
        SELECT
          ci.id,
          ci.slug,
          ci.event_datetime,
          ci.title_zh,
          ci.short_sentence_zh,
          ci.summary_zh,
          ci.symptom_categories,
          ci.visibility,
          GROUP_CONCAT(t.tag, '||') AS tags
        FROM cases_index ci
        LEFT JOIN tags_index t ON ci.id = t.case_id
        GROUP BY ci.id
        ORDER BY ci.event_datetime DESC
      `;

    const sql = limitValue ? `${baseSql} LIMIT ${limitValue}` : baseSql;

    const rows = db.prepare(sql).all() as CaseRow[];

    db.close();

    const normalized = rows.map((row) => {
      let parsedSymptom: unknown[] = [];
      if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories) as unknown;
          if (Array.isArray(parsed)) parsedSymptom = parsed;
        } catch (err) {
          console.warn("Failed to parse symptom_categories", err);
        }
      }
      return normalizeCase({
        ...row,
        symptom_categories: parsedSymptom,
        tags: row.tags
          ? row.tags
              .split("||")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      } as CaseRecord);
    });

    return NextResponse.json({ cases: normalized });
  } catch (error) {
    console.error("Failed to fetch cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 },
    );
  }
}
