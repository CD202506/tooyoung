import { NextResponse } from "next/server";
import type { CaseProfile } from "@/types/profile";
import { loadProfile } from "@/utils/profileStore";
import { CaseRecord } from "@/types/case";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { normalizeCase } from "@/lib/normalizeCase";
import { normalizeProfile } from "@/lib/normalizeProfile";

function loadCases(): CaseRecord[] {
  const dir = path.join(process.cwd(), "data", "cases");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
  const list: CaseRecord[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const json = JSON.parse(raw) as CaseRecord;
      list.push(normalizeCase(json));
    } catch (err) {
      console.warn("failed to load case file", file, err);
    }
  }
  return list;
}

function loadShareMeta() {
  const dbPath = path.join(process.cwd(), "db", "tooyoung.db");
  const db = new Database(dbPath);
  try {
    const row = db
      .prepare(
        "SELECT share_mode, share_token FROM case_profiles WHERE id = 1",
      )
      .get() as { share_mode?: string; share_token?: string | null } | undefined;
    return row ?? null;
  } finally {
    db.close();
  }
}

export async function GET() {
  try {
    const cases = loadCases();
    const profile = normalizeProfile(loadProfile(cases), cases);
    const share = loadShareMeta();
    return NextResponse.json({
      ok: true,
      profile: {
        ...profile,
        share_mode: (share?.share_mode as CaseProfile["share_mode"]) ?? "private",
        share_token: share?.share_token ?? null,
      },
    });
  } catch (error) {
    console.error("profile get error", error);
    return NextResponse.json({ ok: false, error: "Failed to load profile" }, { status: 500 });
  }
}
