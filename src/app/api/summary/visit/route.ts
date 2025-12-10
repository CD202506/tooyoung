import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { loadProfile } from "@/utils/profileStore";

type ScaleRow = {
  id: string;
  date: string;
  mmse_total: number | null;
  cdr_total: number | null;
  doctor_notes: string | null;
  created_at?: string;
  updated_at?: string;
};

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

const DAY_MS = 24 * 60 * 60 * 1000;

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

function fetchLatestScale(): ScaleRow | null {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  if (!fs.existsSync(dbPath)) return null;
  const db = new Database(dbPath);
  try {
    const hasTable = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='case_clinical_scales'",
      )
      .get();
    if (!hasTable) return null;

    const row = db
      .prepare(
        `
        SELECT id, date, mmse_total, cdr_total, doctor_notes, created_at, updated_at
        FROM case_clinical_scales
        ORDER BY date DESC
        LIMIT 1
      `,
      )
      .get() as ScaleRow | undefined;
    return row ?? null;
  } finally {
    db.close();
  }
}

function computeTopSymptoms(cases: CaseRecord[]) {
  const counts = new Map<string, number>();
  for (const c of cases) {
    const cats = c.symptom_categories ?? [];
    if (cats.length === 0) {
      counts.set("未分類", (counts.get("未分類") ?? 0) + 1);
    } else {
      for (const cat of cats) {
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }
  }
  return Array.from(counts.entries())
    .map(([symptom, count]) => ({ symptom, count }))
    .sort((a, b) => b.count - a.count);
}

function computeWorseningSymptoms(cases: CaseRecord[], recentDays: number) {
  const now = Date.now();
  const recentCutoff = now - recentDays * DAY_MS;
  const priorCutoff = now - recentDays * 2 * DAY_MS;

  const recentCounts = new Map<string, number>();
  const priorCounts = new Map<string, number>();

  for (const c of cases) {
    if (!c.event_datetime) continue;
    const ts = new Date(c.event_datetime).getTime();
    if (Number.isNaN(ts)) continue;
    const cats = c.symptom_categories ?? ["未分類"];
    if (ts >= recentCutoff) {
      for (const cat of cats) {
        recentCounts.set(cat, (recentCounts.get(cat) ?? 0) + 1);
      }
    } else if (ts >= priorCutoff && ts < recentCutoff) {
      for (const cat of cats) {
        priorCounts.set(cat, (priorCounts.get(cat) ?? 0) + 1);
      }
    }
  }

  const worsening: string[] = [];
  for (const [sym, recentCount] of recentCounts.entries()) {
    const priorCount = priorCounts.get(sym) ?? 0;
    if (recentCount >= Math.max(priorCount * 1.5, priorCount + 1, 2)) {
      worsening.push(sym);
    }
  }
  return worsening;
}

export async function GET() {
  try {
    const profile = loadProfile();
    const cases = fetchCases();

    const recentDays = 30;
    const nowTs = Date.now();
    const cutoff = nowTs - recentDays * DAY_MS;

    const recentEvents = cases
      .filter((c) => {
        const ts = c.event_datetime ? new Date(c.event_datetime).getTime() : NaN;
        return !Number.isNaN(ts) && ts >= cutoff;
      })
      .sort(
        (a, b) =>
          new Date(b.event_datetime || 0).getTime() -
          new Date(a.event_datetime || 0).getTime(),
      )
      .slice(0, 10);

    const latestScale = fetchLatestScale();
    const topSymptoms = computeTopSymptoms(recentEvents).slice(0, 3);
    const worseningSymptoms = computeWorseningSymptoms(cases, recentDays);

    return NextResponse.json({
      profile,
      latestScale,
      recentEvents,
      symptomHighlights: {
        topSymptoms,
        worseningSymptoms,
      },
      timeframe: {
        recentDays,
        from: new Date(cutoff).toISOString(),
        to: new Date(nowTs).toISOString(),
      },
    });
  } catch (error) {
    console.error("visit summary api error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
