import type { NextApiRequest, NextApiResponse } from "next";
import {
  getAllScales,
  insertScale,
  getScaleById,
} from "@/utils/clinicalScaleStore";
import { ClinicalScaleRecord, ClinicalScaleType } from "@/types/clinicalScale";

function toPayload(record: ClinicalScaleRecord) {
  let payload: unknown = null;
  if (record.payload_json) {
    try {
      payload = JSON.parse(record.payload_json);
    } catch {
      payload = null;
    }
  }
  return { ...record, payload };
}

async function handleGet(res: NextApiResponse) {
  try {
    const records = await getAllScales();
    return res.status(200).json({ ok: true, data: records.map(toPayload) });
  } catch (error) {
    console.error("scales list error", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}

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

    const inserted = await insertScale({
      scale_date: body.scale_date,
      scale_type: body.scale_type,
      total_score:
        body.total_score === null || body.total_score === undefined
          ? null
          : Number(body.total_score),
      payload_json: payloadJson,
      note: body.note ?? null,
    });
    return res.status(200).json({ ok: true, data: toPayload(inserted) });
  } catch (error) {
    console.error("scales new error", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return handleGet(res);
  }
  if (req.method === "POST") {
    return handlePost(req, res);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
