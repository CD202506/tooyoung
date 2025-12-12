import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "node:crypto";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");
const SHARE_BASE =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

function generateToken() {
  return crypto.randomBytes(16).toString("hex"); // 32 hex chars
}

async function handlePOST(_req: NextApiRequest, res: NextApiResponse) {
  const db = new Database(DB_PATH);
  try {
    const profile = db
      .prepare("SELECT id, privacy_level FROM case_profiles WHERE id = 1")
      .get() as { id: number; privacy_level: string } | undefined;

    if (!profile) {
      return res.status(404).json({ error: "profile_not_found" });
    }

    if (profile.privacy_level === "private") {
      return res.status(403).json({ error: "forbidden" });
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

    return res.status(200).json({
      share_url: `${SHARE_BASE}/share/${token}`,
    });
  } finally {
    db.close();
  }
}

async function handleDELETE(_req: NextApiRequest, res: NextApiResponse) {
  const db = new Database(DB_PATH);
  try {
    const profile = db
      .prepare("SELECT id FROM case_profiles WHERE id = 1")
      .get() as { id: number } | undefined;

    if (!profile) {
      return res.status(404).json({ error: "profile_not_found" });
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

    return res.status(200).json({ revoked: true });
  } finally {
    db.close();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      return await handlePOST(req, res);
    }
    if (req.method === "DELETE") {
      return await handleDELETE(req, res);
    }

    res.setHeader("Allow", ["POST", "DELETE"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    console.error("case-profile-share api error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
