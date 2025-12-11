import { NextRequest, NextResponse } from "next/server";
import { updateScale, getScaleById } from "@/utils/clinicalScaleStore";
import { scoreCDR, scoreMMSE } from "@/lib/scaleScoring";

type UpdatePayload = {
  total_score?: number | null;
  payload?: unknown;
  note?: string | null;
};

export async function POST(request: NextRequest, context: any) {
  try {
    const { id } = context.params;

    const numericId = Number(id);
    if (Number.isNaN(numericId)) {
      return NextResponse.json(
        { ok: false, error: "invalid id" },
        { status: 400 }
      );
    }

    const body = (await request.json()) as UpdatePayload;

    const existing = await getScaleById(numericId);
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 }
      );
    }

    const payloadJson =
      body.payload === undefined
        ? existing.payload_json
        : JSON.stringify(body.payload);

    let totalScore: number | null =
      body.total_score === undefined
        ? existing.total_score
        : body.total_score;

    // Scoring for MMSE
    if (
      existing.scale_type === "MMSE" &&
      body.payload &&
      typeof body.payload === "object"
    ) {
      try {
        const scored = scoreMMSE(
          body.payload as Record<string, number> as never
        );
        totalScore = scored.total;
      } catch {
        // ignore scoring failure
      }
    }

    // Scoring for CDR
    if (
      existing.scale_type === "CDR" &&
      body.payload &&
      typeof body.payload === "object"
    ) {
      try {
        const scored = scoreCDR(
          body.payload as Record<string, number> as never
        );
        totalScore = scored.global;
      } catch {
        // ignore scoring failure
      }
    }

    const updated = await updateScale(numericId, {
      total_score: totalScore,
      payload_json: payloadJson,
      note: body.note === undefined ? existing.note ?? null : body.note,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("scales update error", error);
    return NextResponse.json(
      { ok: false, error: "internal_error" },
      { status: 500 }
    );
  }
}
