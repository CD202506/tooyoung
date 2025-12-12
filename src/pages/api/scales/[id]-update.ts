import type { NextApiRequest, NextApiResponse } from "next";
import { updateScale, getScaleById } from "@/utils/clinicalScaleStore";
import { scoreCDR, scoreMMSE } from "@/lib/scaleScoring";

type UpdatePayload = {
  total_score?: number | null;
  payload?: unknown;
  note?: string | null;
};

async function handleUpdate(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    const numericId = Number(Array.isArray(id) ? id[0] : id);
    if (Number.isNaN(numericId)) {
      return res.status(400).json({ ok: false, error: "invalid id" });
    }

    const body = (req.body ?? {}) as UpdatePayload;

    const existing = await getScaleById(numericId);
    if (!existing) {
      return res.status(404).json({ ok: false, error: "not_found" });
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

    return res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    console.error("scales update error", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT") {
    return handleUpdate(req, res);
  }

  res.setHeader("Allow", ["POST", "PATCH", "PUT"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
