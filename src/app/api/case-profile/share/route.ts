import { NextResponse } from "next/server";
import crypto from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");
const SHARE_BASE = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

function generateToken() {
  return crypto.randomBytes(16).toString("hex"); // 32 hex chars
}

export async function POST() {
  const db = new Database(DB_PATH);
  try {
    const profile = db
      .prepare("SELECT id, privacy_level FROM case_profiles WHERE id = 1")
      .get() as { id: number; privacy_level: string } | undefined;

    if (!profile) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    }

    if (profile.privacy_level === "private") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const token = generateToken();
    const now = new Date().toISOString();
    db.prepare(
      `
      UPDATE case_profiles
      SET share_token = @token,
          updated_at = @now
      WHERE id = @id
    `,
    ).run({ token, now, id: profile.id });

    return NextResponse.json({
      share_url: `${SHARE_BASE}/share/${token}`,
    });
  } finally {
    db.close();
  }
}

export async function DELETE() {
  const db = new Database(DB_PATH);
  try {
    const profile = db
      .prepare("SELECT id FROM case_profiles WHERE id = 1")
      .get() as { id: number } | undefined;

    if (!profile) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    db.prepare(
      `
      UPDATE case_profiles
      SET share_token = NULL,
          updated_at = @now
      WHERE id = @id
    `,
    ).run({ now, id: profile.id });

    return NextResponse.json({ revoked: true });
  } finally {
    db.close();
  }
}
