export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    const records = await getAllScales();
    return NextResponse.json({
      ok: true,
      data: records.map(toPayload),
    });
  } catch (error) {
    console.error("scales list error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}

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
    return NextResponse.json({ ok: true, data: toPayload(inserted) });
  } catch (error) {
    console.error("scales new error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
