import { NextResponse } from "next/server";
import { getScaleById } from "@/utils/clinicalScaleStore";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
    }
    const record = await getScaleById(id);
    if (!record) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    let payload: unknown = null;
    if (record.payload_json) {
      try {
        payload = JSON.parse(record.payload_json);
      } catch {
        payload = null;
      }
    }
    return NextResponse.json({ ok: true, data: { ...record, payload } });
  } catch (error) {
    console.error("scales get error", error);
    return NextResponse.json({ ok: false, error: "internal_error" }, { status: 500 });
  }
}
