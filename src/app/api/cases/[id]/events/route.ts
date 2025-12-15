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
      `SELECT id, case_id as caseId, date, title, note, severity
       FROM case_events
       WHERE case_id = ?
       ORDER BY date DESC, id DESC`,
    )
    .all(caseId);

  return NextResponse.json({ events: rows });
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
  const date = String(body?.date || "").trim();
  const title = String(body?.title || "").trim();
  const note = body?.note ? String(body.note) : null;
  const severity = Number(body?.severity ?? 0);

  if (!date || !title)
    return NextResponse.json(
      { error: "date_title_required" },
      { status: 400 },
    );

  const db = getDb();
  const info = db
    .prepare(
      `INSERT INTO case_events (case_id, date, title, note, severity)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(caseId, date, title, note, Number.isFinite(severity) ? severity : 0);

  return NextResponse.json({
    id: Number(info.lastInsertRowid),
    caseId,
    date,
    title,
    note,
    severity,
  });
}
