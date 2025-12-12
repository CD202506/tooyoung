import type { NextApiRequest, NextApiResponse } from "next";
import path from "node:path";
import Database from "better-sqlite3";
import type { CaseProfile } from "@/types/profile";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");

const VALID_PRIVACY = new Set<CaseProfile["privacy_mode"]>([
  "public",
  "masked",
  "private",
]);
const VALID_SHARE = new Set<NonNullable<CaseProfile["share_mode"]>>([
  "private",
  "protected",
  "public",
]);

function getDb() {
  return new Database(DB_PATH);
}

async function handleGET(_req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  try {
    const row = db
      .prepare(
        `
        SELECT id, display_name, privacy_mode, share_mode, share_token, birth_year, gender
        FROM case_profiles
        WHERE id = 1
      `,
      )
      .get() as
      | {
          id: number;
          display_name: string;
          privacy_mode: CaseProfile["privacy_mode"];
          share_mode?: CaseProfile["share_mode"];
          share_token: string | null;
          birth_year: number | null;
          gender: CaseProfile["gender"] | null;
        }
      | undefined;

    if (!row) {
      return res.status(404).json({ error: "profile_not_found" });
    }

    return res.status(200).json({
      ...row,
      share_mode: row.share_mode ?? "private",
    });
  } finally {
    db.close();
  }
}

async function handlePATCH(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  try {
    const body = (req.body || {}) as Partial<CaseProfile>;
    const privacy = body.privacy_mode;
    const shareMode = body.share_mode;

    if (privacy && !VALID_PRIVACY.has(privacy)) {
      return res.status(400).json({ error: "invalid_privacy_mode" });
    }

    if (shareMode && !VALID_SHARE.has(shareMode)) {
      return res.status(400).json({ error: "invalid_share_mode" });
    }

    const now = new Date().toISOString();

    if (privacy === "masked") {
      db.prepare(
        `
        UPDATE case_profiles
        SET privacy_mode = @privacy,
            share_token = NULL,
            updated_at = @now
        WHERE id = 1
      `,
      ).run({ privacy, now });

      return res.status(200).json({ ok: true, token_revoked: true });
    }

    if (privacy) {
      db.prepare(
        `
        UPDATE case_profiles
        SET privacy_mode = @privacy,
            updated_at = @now
        WHERE id = 1
      `,
      ).run({ privacy, now });
    }

    if (shareMode) {
      db.prepare(
        `
        UPDATE case_profiles
        SET share_mode = @share_mode,
            updated_at = @now
        WHERE id = 1
      `,
      ).run({ share_mode: shareMode, now });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("case-profile PATCH error", error);
    return res.status(500).json({ error: "internal_error" });
  } finally {
    db.close();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      return await handleGET(req, res);
    }
    if (req.method === "PATCH") {
      return await handlePATCH(req, res);
    }

    res.setHeader("Allow", ["GET", "PATCH"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("case-profile api error", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
