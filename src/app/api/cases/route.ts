import { NextResponse } from "next/server";
import { getDb } from "@/db/db";

export async function GET() {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, title, created_at as createdAt, updated_at as updatedAt
       FROM case_profiles
       ORDER BY id DESC`,
    )
    .all();
  return NextResponse.json({ cases: rows });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const title = String(body?.title || "").trim();
  if (!title)
    return NextResponse.json({ error: "title_required" }, { status: 400 });

  const db = getDb();
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO case_profiles (user_id, title, created_at, updated_at)
       VALUES (1, ?, ?, ?)`,
    )
    .run(title, now, now);

  return NextResponse.json({
    id: Number(info.lastInsertRowid),
    title,
    createdAt: now,
    updatedAt: now,
  });
}
