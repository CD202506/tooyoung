import type { NextApiRequest, NextApiResponse } from "next";
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

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = (req.body ?? {}) as NewPayload;
    if (!body.scale_date || !body.scale_type) {
      return res.status(400).json({ ok: false, error: "missing fields" });
    }
    if (!["MMSE", "CDR", "OTHER"].includes(body.scale_type)) {
      return res.status(400).json({ ok: false, error: "invalid scale_type" });
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
    return res.status(200).json({ ok: true, data: inserted });
  } catch (error) {
    console.error("scales/new error", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
