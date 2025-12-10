import { NextResponse } from "next/server";
import path from "node:path";
import Database from "better-sqlite3";
import type { CaseProfile } from "@/types/caseProfile";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");

const VALID_PRIVACY = new Set<CaseProfile["privacy_level"]>(["private", "limited", "public"]);

function getDb() {
  return new Database(DB_PATH);
}

export async function GET() {
  const db = getDb();
  try {
    const row = db
      .prepare(
        `
        SELECT id, display_name, privacy_level, share_token, birth_year, gender
        FROM case_profiles
        WHERE id = 1
      `,
      )
      .get() as
      | {
          id: number;
          display_name: string;
          privacy_level: CaseProfile["privacy_level"];
          share_token: string | null;
          birth_year: number | null;
          gender: CaseProfile["gender"] | null;
        }
      | undefined;

    if (!row) {
      return NextResponse.json({ error: "profile_not_found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } finally {
    db.close();
  }
}

export async function PATCH(request: Request) {
  const db = getDb();
  try {
    const body = (await request.json()) as Partial<CaseProfile>;
    const privacy = body.privacy_level;

    if (!privacy || !VALID_PRIVACY.has(privacy)) {
      return NextResponse.json({ error: "invalid_privacy_level" }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (privacy === "private") {
      db.prepare(
        `
        UPDATE case_profiles
        SET privacy_level = @privacy,
            share_token = NULL,
            updated_at = @now
        WHERE id = 1
      `,
      ).run({ privacy, now });

      return NextResponse.json({ ok: true, token_revoked: true });
    }

    db.prepare(
      `
      UPDATE case_profiles
      SET privacy_level = @privacy,
          updated_at = @now
      WHERE id = 1
    `,
    ).run({ privacy, now });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("case-profile PATCH error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  } finally {
    db.close();
  }
}
