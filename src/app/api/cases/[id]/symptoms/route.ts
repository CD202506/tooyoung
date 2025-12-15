import { NextResponse } from "next/server";
import { getDb } from "@/db/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const caseId = Number(idParam);
  if (!Number.isFinite(caseId))
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, case_id as caseId, name, frequency, severity, last_observed as lastObserved
       FROM case_symptoms
       WHERE case_id = ?
       ORDER BY id DESC`,
    )
    .all(caseId);

  return NextResponse.json({ symptoms: rows });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const caseId = Number(idParam);
  if (!Number.isFinite(caseId))
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name || "").trim();
  const frequency = body?.frequency ? String(body.frequency) : null;
  const severity = Number(body?.severity ?? 0);
  const lastObserved = body?.lastObserved ? String(body.lastObserved) : null;

  if (!name)
    return NextResponse.json({ error: "name_required" }, { status: 400 });

  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO case_symptoms (case_id, name, frequency, severity, last_observed)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      caseId,
      name,
      frequency,
      Number.isFinite(severity) ? severity : 0,
      lastObserved,
    );

  return NextResponse.json({
    id: Number(info.lastInsertRowid),
    caseId,
    name,
    frequency,
    severity,
    lastObserved,
  });
}
