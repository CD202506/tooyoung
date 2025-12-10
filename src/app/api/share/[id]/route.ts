import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { normalizeCase } from "@/lib/normalizeCase";
import { loadProfile } from "@/utils/profileStore";
import { publicFilterCases, PublicCase } from "@/lib/publicFilter";
import { CaseRecord } from "@/types/case";

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

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const profile = loadProfile();

    if (profile.privacy_mode === "private") {
      return NextResponse.json({ error: "share_disabled" }, { status: 403 });
    }

    const allCases = loadCases().sort(
      (a, b) =>
        new Date(b.event_datetime || 0).getTime() -
        new Date(a.event_datetime || 0).getTime(),
    );

    const limited = allCases.slice(0, 60);
    const filteredCases: PublicCase[] = publicFilterCases(limited, {
      privacy_mode: profile.privacy_mode,
    });

    // id 目前固定 default，但保留路由參數以後擴充
    return NextResponse.json({
      profile,
      cases: filteredCases,
    });
  } catch (error) {
    console.error("share route error", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
