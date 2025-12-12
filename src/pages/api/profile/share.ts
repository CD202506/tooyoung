export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "node:path";
import crypto from "node:crypto";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");
const VALID_SHARE = new Set(["private", "protected", "public"]);

function getDb() {
  return new Database(DB_PATH);
}

function generateToken() {
  return crypto.randomBytes(24).toString("hex");
}

export async function POST(request: Request) {
  const db = getDb();
  try {
    const body = (await request.json()) as {
      profile_id?: number;
      share_mode: "private" | "protected" | "public";
      regenerate_token?: boolean;
    };

    const profileId = body.profile_id ?? 1;
    const shareMode = body.share_mode;
    const regenerate = body.regenerate_token === true;

    if (!VALID_SHARE.has(shareMode)) {
      return NextResponse.json({ error: "invalid_share_mode" }, { status: 400 });
    }

    const current = db
      .prepare(
        "SELECT share_mode, share_token FROM case_profiles WHERE id = ?",
      )
      .get(profileId) as { share_mode?: string; share_token?: string | null } | undefined;

    if (!current) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    }

    let nextToken = current.share_token ?? null;
    if (shareMode === "private") {
      nextToken = null;
    } else if (shareMode === "protected") {
      if (regenerate || !nextToken) {
        nextToken = generateToken();
      }
    }

    const now = new Date().toISOString();
    db.prepare(
      `
      UPDATE case_profiles
      SET share_mode = @share_mode,
          share_token = @share_token,
          updated_at = @now
      WHERE id = @id
    `,
    ).run({
      share_mode: shareMode,
      share_token: shareMode === "private" ? null : nextToken,
      now,
      id: profileId,
    });

    return NextResponse.json({
      profile_id: profileId,
      share_mode: shareMode,
      share_token: shareMode === "protected" ? nextToken : null,
      share_url:
        shareMode === "protected" && nextToken
          ? `/share/{slug}?token=${nextToken}`
          : null,
      updated: true,
    });
  } catch (error) {
    console.error("profile share update error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  } finally {
    db.close();
  }
}
