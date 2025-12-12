export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { CaseRecord } from "@/types/case";
import { loadProfile } from "@/utils/profileStore";
import { normalizeCase } from "@/lib/normalizeCase";
import {
  ClinicalScale,
  findNearbyEventsForScales,
  groupEventsByDay,
  sortScalesChronologically,
} from "@/lib/analyticsClinicalHelpers";

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

function fetchCases(): CaseRecord[] {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  if (!fs.existsSync(dbPath)) return [];
  const db = new Database(dbPath);
  try {
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

    const rows = db.prepare(baseSql).all() as CaseRow[];

    return rows.map((row) => {
      let parsedSymptom: string[] = [];
      if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories) as unknown;
          if (Array.isArray(parsed)) {
            parsedSymptom = parsed.filter((x): x is string => typeof x === "string");
          }
        } catch (err) {
          console.warn("Failed to parse symptom_categories", err);
        }
      }
      const tags =
        row.tags
          ?.split("||")
          .map((t) => t.trim())
          .filter(Boolean) ?? [];

      return normalizeCase({
        ...row,
        symptom_categories: parsedSymptom,
        tags,
      } as CaseRecord);
    });
  } finally {
    db.close();
  }
}

function fetchScales(): ClinicalScale[] {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  if (!fs.existsSync(dbPath)) return [];
  const db = new Database(dbPath);
  try {
    const hasTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='case_clinical_scales'",
      )
      .get();
    if (!hasTable) return [];

    const rows = db
      .prepare(
        `
        SELECT id, date, mmse_total, cdr_total, doctor_notes, created_at, updated_at
        FROM case_clinical_scales
        ORDER BY date ASC
      `,
      )
      .all() as ClinicalScale[];

    return rows.map((r) => ({
      ...r,
      mmse_total:
        typeof r.mmse_total === "number" && !Number.isNaN(r.mmse_total)
          ? r.mmse_total
          : null,
      cdr_total:
        typeof r.cdr_total === "number" && !Number.isNaN(r.cdr_total)
          ? r.cdr_total
          : null,
    }));
  } finally {
    db.close();
  }
}

export async function GET() {
  try {
    const profile = loadProfile();
    const cases = fetchCases();
    const scales = fetchScales();

    const sortedScales = sortScalesChronologically(scales);
    const symptomTrend = groupEventsByDay(cases, 180);
    const linkedEvents = findNearbyEventsForScales(sortedScales, cases, 7);

    return NextResponse.json({
      profile,
      scales: sortedScales,
      symptomTrend,
      linkedEvents,
    });
  } catch (error) {
    console.error("clinical analytics api error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
