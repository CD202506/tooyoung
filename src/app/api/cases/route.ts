export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import Database from "better-sqlite3";

type CaseRow = {
  id: string;
  slug: string;
  case_id?: number | null;
  event_datetime: string;
  title_zh: string | null;
  short_sentence_zh: string | null;
  summary_zh: string | null;
  symptom_categories?: string | null;
  tags?: string | null;
  visibility?: string | null;
  share_mode?: string | null;
  share_token?: string | null;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const caseIdParam = searchParams.get("case_id");
    const limitValue =
      limitParam && Number.isFinite(Number(limitParam))
        ? Math.max(1, Number(limitParam))
        : null;
    const caseFilter =
      caseIdParam && Number.isFinite(Number(caseIdParam))
        ? Number(caseIdParam)
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
    const hasCaseIdColumn = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'case_id'")
      .get();
    if (!hasCaseIdColumn) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN case_id INTEGER DEFAULT 1").run();
    }
    const hasShareModeColumn = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'share_mode'")
      .get();
    if (!hasShareModeColumn) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN share_mode TEXT DEFAULT 'private'").run();
    }
    const hasShareTokenColumn = db
      .prepare("SELECT 1 FROM pragma_table_info('cases_index') WHERE name = 'share_token'")
      .get();
    if (!hasShareTokenColumn) {
      db.prepare("ALTER TABLE cases_index ADD COLUMN share_token TEXT").run();
    }

    const where: string[] = [];
    if (caseFilter) {
      where.push("ci.case_id = @caseId");
    }

    const baseSql = `
        SELECT
          ci.id,
          ci.slug,
          ci.case_id,
          ci.event_datetime,
          ci.title_zh,
          ci.short_sentence_zh,
          ci.summary_zh,
          ci.symptom_categories,
          ci.share_mode,
          ci.share_token,
          ci.visibility,
          GROUP_CONCAT(t.tag, '||') AS tags
        FROM cases_index ci
        LEFT JOIN tags_index t ON ci.id = t.case_id
        ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
        GROUP BY ci.id
        ORDER BY ci.event_datetime DESC
      `;

    const sql = limitValue ? `${baseSql} LIMIT ${limitValue}` : baseSql;

    const rows = db.prepare(sql).all(caseFilter ? { caseId: caseFilter } : {}) as CaseRow[];

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
        case_id: row.case_id ?? 1,
        symptom_categories: parsedSymptom,
        share_mode: (row.share_mode as string | null) ?? "private",
        share_token: row.share_token ?? null,
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
