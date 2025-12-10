import { NextResponse } from "next/server";
import { ClinicalScaleRecord } from "@/types/clinicalScale";
import { getAllScales } from "@/utils/clinicalScaleStore";

function buildMmse(scales: ClinicalScaleRecord[]) {
  const mmse = scales
    .filter((s) => s.scale_type === "MMSE" && s.total_score !== null && s.total_score !== undefined)
    .sort((a, b) => new Date(a.scale_date).getTime() - new Date(b.scale_date).getTime());

  if (mmse.length === 0) {
    return {
      points: [],
      slope_per_year: null,
      slope_per_6m: null,
      latest: null,
    };
  }

  const points = mmse.map((m) => ({ date: m.scale_date, score: Number(m.total_score) }));
  let slopePerYear = 0;
  if (mmse.length >= 2) {
    const first = mmse[0];
    const last = mmse[mmse.length - 1];
    const deltaScore = Number(last.total_score) - Number(first.total_score);
    const deltaYears =
      (new Date(last.scale_date).getTime() - new Date(first.scale_date).getTime()) /
      (365 * 24 * 60 * 60 * 1000);
    slopePerYear = deltaYears === 0 ? 0 : deltaScore / deltaYears;
  }

  return {
    points,
    slope_per_year: slopePerYear,
    slope_per_6m: slopePerYear * 0.5,
    latest: points[points.length - 1],
  };
}

function buildCdr(scales: ClinicalScaleRecord[]) {
  const cdr = scales
    .filter((s) => s.scale_type === "CDR" && s.total_score !== null && s.total_score !== undefined)
    .sort((a, b) => new Date(a.scale_date).getTime() - new Date(b.scale_date).getTime());

  if (cdr.length === 0) {
    return {
      points: [],
      latest: null,
      transitions: [],
    };
  }

  const points = cdr.map((c) => ({ date: c.scale_date, global: Number(c.total_score) }));
  const transitions: { from: number; to: number; date: string }[] = [];
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].global !== points[i - 1].global) {
      transitions.push({
        from: points[i - 1].global,
        to: points[i].global,
        date: points[i].date,
      });
    }
  }

  return {
    points,
    latest: points[points.length - 1],
    transitions,
  };
}

export async function GET() {
  try {
    const records = await getAllScales();
    const mmse = buildMmse(records);
    const cdr = buildCdr(records);
    return NextResponse.json({ ok: true, mmse, cdr });
  } catch (error) {
    console.error("scales trend error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
