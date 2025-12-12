import type { NextApiRequest, NextApiResponse } from "next";
import { getScaleById } from "@/utils/clinicalScaleStore";

// -------------------------
// GET /api/scales/[id]
// -------------------------
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const numericId = Number(Array.isArray(id) ? id[0] : id);

    if (Number.isNaN(numericId)) {
      return res.status(400).json({ ok: false, error: "invalid id" });
    }

    const record = await getScaleById(numericId);
    if (!record) {
      return res.status(404).json({ ok: false, error: "not_found" });
    }

    let payload: unknown = null;
    if (record.payload_json) {
      try {
        payload = JSON.parse(record.payload_json);
      } catch {
        payload = null;
      }
    }

    return res.status(200).json({ ok: true, data: { ...record, payload } });
  } catch (error) {
    console.error("scales GET error", error);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }

  res.setHeader("Allow", ["GET"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
