import { NextResponse } from "next/server";
import { getDb } from "@/db/db";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id))
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });

  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, title, created_at as createdAt, updated_at as updatedAt
       FROM case_profiles
       WHERE id = ?`,
    )
    .get(id);

  if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ case: row });
}
