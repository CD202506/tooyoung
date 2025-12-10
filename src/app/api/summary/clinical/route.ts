import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { buildClinicalSummary } from "@/lib/clinicalSummary";
import { loadProfile } from "@/utils/profileStore";

function loadCases(): CaseRecord[] {
  const dir = path.join(process.cwd(), "data", "cases");
  if (!fs.existsSync(dir)) return [];
    const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"));

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

export async function GET() {
  try {
    const profile = loadProfile();
    const cases = loadCases();
    const clinicalSummary = buildClinicalSummary(profile, cases, 60);
    return NextResponse.json({ profile, clinicalSummary });
  } catch (error) {
    console.error("clinical summary error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
