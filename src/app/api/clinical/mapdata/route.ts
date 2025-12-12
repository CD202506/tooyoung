export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { normalizeCase } from "@/lib/normalizeCase";
import { detectStage } from "@/lib/stageDetector";
import { CaseRecord } from "@/types/case";
import { ClinicalScaleRecord } from "@/types/clinicalScale";
import { getAllScales } from "@/utils/clinicalScaleStore";

type CaseRow = {
  id: string;
  slug: string;
  event_datetime: string;
  title_zh: string | null;
  summary_zh: string | null;
  short_sentence_zh?: string | null;
  symptom_categories?: string | null;
  tags?: string | null;
};

function fetchCases(): CaseRecord[] {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  if (!fs.existsSync(dbPath)) return [];
  const db = new Database(dbPath);

  try {
    const rows = db
      .prepare(
        `
        SELECT
          ci.id,
          ci.slug,
          ci.event_datetime,
          ci.title_zh,
          ci.summary_zh,
          ci.short_sentence_zh,
          ci.symptom_categories,
          GROUP_CONCAT(t.tag, '||') AS tags
        FROM cases_index ci
        LEFT JOIN tags_index t ON ci.id = t.case_id
        GROUP BY ci.id
        ORDER BY ci.event_datetime DESC
      `,
      )
      .all() as CaseRow[];

    return rows.map((row) => {
      let parsedSymptom: string[] = [];
      if (row.symptom_categories) {
        try {
          const parsed = JSON.parse(row.symptom_categories) as unknown;
          if (Array.isArray(parsed)) {
            parsedSymptom = parsed.filter((x): x is string => typeof x === "string");
          }
        } catch (error) {
          console.warn("mapdata: parse symptom_categories failed", error);
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
  } catch (error) {
    console.error("mapdata cases query failed", error);
    return [];
  } finally {
    db.close();
  }
}

function buildMmse(scales: ClinicalScaleRecord[]) {
  return scales
    .filter(
      (s) =>
        s.scale_type === "MMSE" &&
        s.total_score !== null &&
        s.total_score !== undefined,
    )
    .map((s) => ({
      date: s.scale_date,
      score: Number(s.total_score),
      id: s.id,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildCdr(scales: ClinicalScaleRecord[]) {
  return scales
    .filter(
      (s) =>
        s.scale_type === "CDR" &&
        s.total_score !== null &&
        s.total_score !== undefined,
    )
    .map((s) => ({
      date: s.scale_date,
      global: Number(s.total_score),
      id: s.id,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function GET() {
  try {
    const cases = fetchCases();
    let scales: ClinicalScaleRecord[] = [];
    try {
      scales = await getAllScales();
    } catch (error) {
      console.error("mapdata scales query failed", error);
      scales = [];
    }
    const stage = detectStage(cases, undefined, scales);

    const mmse = buildMmse(scales);
    const cdr = buildCdr(scales);

    return NextResponse.json({
      ok: true,
      cases,
      mmse,
      cdr,
      stage,
    });
  } catch (error) {
    console.error("clinical mapdata api error", error);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 },
    );
  }
}
