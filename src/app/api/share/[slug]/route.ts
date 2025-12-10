import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { normalizeCase } from "@/lib/normalizeCase";
import { CaseRecord } from "@/types/case";

const DB_PATH = path.join(process.cwd(), "db", "tooyoung.db");

function parseSymptomCategories(value: unknown): string[] {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) {
    return value.filter((x): x is string => typeof x === "string");
  }
  return [];
}

function normalizeImages(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (typeof v === "string") return v;
        if (v && typeof v === "object" && "file" in v) {
          const file = (v as { file?: string }).file;
          return typeof file === "string" ? file : null;
        }
        return null;
      })
      .filter((v): v is string => typeof v === "string");
  }
  return [];
}

export async function GET(request: Request, context: { params: { slug: string } }) {
  const slug = context.params.slug;
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? undefined;

  const db = new Database(DB_PATH);
  try {
    const row = db
      .prepare(
        `
        SELECT
          ci.*,
          cp.share_mode,
          cp.share_token,
          cp.display_name,
          cp.nickname
        FROM cases_index ci
        LEFT JOIN case_profiles cp ON ci.case_id = cp.id
        WHERE ci.slug = ?
      `,
      )
      .get(slug) as
      | (Record<string, unknown> & {
          share_mode?: string;
          share_token?: string | null;
          display_name?: string;
          nickname?: string;
        })
      | undefined;

    if (!row) {
      return NextResponse.json({ error: "Case not found." }, { status: 404 });
    }

    const shareMode = (row.share_mode as string) ?? "private";
    if (shareMode === "private") {
      return NextResponse.json({ error: "This case is not shared." }, { status: 403 });
    }
    if (shareMode === "protected") {
      if (!token || token !== (row.share_token as string | null)) {
        return NextResponse.json({ error: "Invalid or missing token." }, { status: 403 });
      }
    }

    const casePath = path.join(process.cwd(), "data", "cases", `${row.id}.json`);
    if (!fs.existsSync(casePath)) {
      return NextResponse.json({ error: "Case file not found." }, { status: 404 });
    }
    const raw = fs.readFileSync(casePath, "utf-8");
    const json = JSON.parse(raw) as CaseRecord;
    const normalized = normalizeCase(json);

    const tagsRows = db
      .prepare("SELECT tag FROM tags_index WHERE case_id = ?")
      .all(row.id) as { tag: string }[];
    const tags = tagsRows.map((t) => t.tag);

    const title =
      typeof normalized.title === "object"
        ? normalized.title?.zh ?? normalized.title?.en ?? normalized.title_zh ?? ""
        : normalized.title_zh ?? "";
    const summary =
      typeof normalized.summary === "object"
        ? normalized.summary?.zh ?? normalized.summary?.en ?? normalized.summary_zh ?? ""
        : normalized.summary_zh ?? "";
    const content =
      typeof normalized.content === "object"
        ? normalized.content?.zh ?? normalized.content?.en ?? normalized.content_zh ?? ""
        : normalized.content_zh ?? "";

    const normalizedPhotos = normalizeImages(normalized.photos);

    return NextResponse.json({
      case: {
        id: normalized.id,
        slug: normalized.slug ?? slug,
        title,
        event_datetime: normalized.event_datetime ?? null,
        summary,
        content,
        tags,
        symptom_categories: normalized.symptom_categories ?? parseSymptomCategories(row.symptom_categories),
        images: normalizedPhotos,
      },
      profile: {
        id: (row.case_id as number | undefined) ?? 1,
        display_name: (row.display_name as string | undefined) ?? "匿名",
        nickname: (row.nickname as string | undefined) ?? (row.display_name as string | undefined) ?? "",
      },
      meta: {
        share_mode: shareMode,
      },
    });
  } catch (error) {
    console.error("share by slug error", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  } finally {
    db.close();
  }
}
