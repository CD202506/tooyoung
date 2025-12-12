import type { NextApiRequest, NextApiResponse } from "next";
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

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  try {
    const body = (req.body ?? {}) as {
      profile_id?: number;
      share_mode: "private" | "protected" | "public";
      regenerate_token?: boolean;
    };

    const profileId = body.profile_id ?? 1;
    const shareMode = body.share_mode;
    const regenerate = body.regenerate_token === true;

    if (!VALID_SHARE.has(shareMode)) {
      return res.status(400).json({ error: "invalid_share_mode" });
    }

    const current = db
      .prepare(
        "SELECT share_mode, share_token FROM case_profiles WHERE id = ?",
      )
      .get(profileId) as { share_mode?: string; share_token?: string | null } | undefined;

    if (!current) {
      return res.status(404).json({ error: "profile_not_found" });
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

    return res.status(200).json({
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
    return res.status(500).json({ error: "internal_error" });
  } finally {
    db.close();
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();
  try {
    const body = (req.body ?? {}) as { profile_id?: number };
    const profileId = body.profile_id ?? 1;

    const now = new Date().toISOString();
    db.prepare(
      `
      UPDATE case_profiles
      SET share_mode = 'private',
          share_token = NULL,
          updated_at = @now
      WHERE id = @id
    `,
    ).run({ now, id: profileId });

    return res.status(200).json({
      profile_id: profileId,
      share_mode: "private",
      share_token: null,
      share_url: null,
      updated: true,
    });
  } catch (error) {
    console.error("profile share delete error", error);
    return res.status(500).json({ error: "internal_error" });
  } finally {
    db.close();
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    return handlePost(req, res);
  }
  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }

  res.setHeader("Allow", ["POST", "DELETE"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
