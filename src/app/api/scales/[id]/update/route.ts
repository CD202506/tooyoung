import { NextResponse } from "next/server";
import { updateScale, getScaleById } from "@/utils/clinicalScaleStore";
import { scoreCDR, scoreMMSE } from "@/lib/scaleScoring";

type UpdatePayload = {
  total_score?: number | null;
  payload?: unknown;
  note?: string | null;
};

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }
    const body = (await req.json()) as UpdatePayload;
    const existing = await getScaleById(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const payloadJson =
      body.payload === undefined ? existing.payload_json : JSON.stringify(body.payload);

    let totalScore: number | null =
      body.total_score === undefined ? existing.total_score : body.total_score;

    if (existing.scale_type === "MMSE" && body.payload && typeof body.payload === "object") {
      try {
        const scored = scoreMMSE(body.payload as Record<string, number> as never);
        totalScore = scored.total;
      } catch {
        // ignore
      }
    }
    if (existing.scale_type === "CDR" && body.payload && typeof body.payload === "object") {
      try {
        const scored = scoreCDR(body.payload as Record<string, number> as never);
        totalScore = scored.global;
      } catch {
        // ignore
      }
    }

    const updated = await updateScale(id, {
      total_score: totalScore,
      payload_json: payloadJson,
      note: body.note === undefined ? existing.note ?? null : body.note,
    });

    return NextResponse.json({ ok: true, data: updated });
  } catch (error) {
    console.error("scales update error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
