import { NextResponse } from "next/server";
import { ClinicalScaleType } from "@/types/clinicalScale";
import { insertScale } from "@/utils/clinicalScaleStore";
import { scoreCDR, scoreMMSE } from "@/lib/scaleScoring";

type NewPayload = {
  scale_date: string;
  scale_type: ClinicalScaleType;
  total_score: number | null;
  payload?: unknown;
  note?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NewPayload;
    if (!body.scale_date || !body.scale_type) {
      return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
    }
    if (!["MMSE", "CDR", "OTHER"].includes(body.scale_type)) {
      return NextResponse.json({ ok: false, error: "invalid scale_type" }, { status: 400 });
    }
    const payloadJson =
      body.payload === undefined ? null : JSON.stringify(body.payload);

    let totalScore: number | null =
      body.total_score === null || body.total_score === undefined
        ? null
        : Number(body.total_score);

    if (body.scale_type === "MMSE" && body.payload && typeof body.payload === "object") {
      try {
        const scored = scoreMMSE(body.payload as Record<string, number> as never);
        totalScore = scored.total;
      } catch {
        // fallback to provided total_score
      }
    }
    if (body.scale_type === "CDR" && body.payload && typeof body.payload === "object") {
      try {
        const scored = scoreCDR(body.payload as Record<string, number> as never);
        totalScore = scored.global;
      } catch {
        // ignore
      }
    }

    const inserted = await insertScale({
      scale_date: body.scale_date,
      scale_type: body.scale_type,
      total_score: totalScore,
      payload_json: payloadJson,
      note: body.note ?? null,
    });
    return NextResponse.json({ ok: true, data: inserted });
  } catch (error) {
    console.error("scales/new error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
