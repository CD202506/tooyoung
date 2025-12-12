export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { promises as fsp } from "fs";
import Database from "better-sqlite3";
import { syncCasesToSQLite } from "@/utils/syncCasesToSQLite";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { normalizeVisibility } from "@/lib/caseVisibility";

const db = new Database(path.join(process.cwd(), "db", "tooyoung.db"));

function toIso(date: string, time: string) {
  return `${date}T${time}:00+08:00`;
}

function buildIdFromNow() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day}T${hh}-${mm}-${ss}-001`;
}

async function ensureExampleCase(): Promise<CaseRecord | null> {
  try {
    const casesDir = path.join(process.cwd(), "data", "cases");
    await fsp.mkdir(casesDir, { recursive: true });

    const filePath = path.join(casesDir, "example-slug.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return normalizeCase(parsed as CaseRecord);
    }

    const tmplPath = path.join(casesDir, "case-template.json");
    const rawTmpl = fs.readFileSync(tmplPath, "utf-8");
    const tmpl = JSON.parse(rawTmpl) as CaseRecord;
    const nowIso = new Date().toISOString();

    const payload: CaseRecord = normalizeCase({
      ...tmpl,
      id: "example-slug",
      slug: "example-slug",
      event_datetime: tmpl.event_datetime || nowIso,
      recorded_at: tmpl.recorded_at || tmpl.event_datetime || nowIso,
      created_at: nowIso,
      updated_at: nowIso,
      data_version: 1,
      photos: Array.isArray(tmpl.photos) ? tmpl.photos : [],
      attachments: Array.isArray(tmpl.attachments) ? tmpl.attachments : [],
    });

    await fsp.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

    // Best effort sync; 即使失敗也先回 200，不擋讀取
    try {
      db.prepare("DELETE FROM cases_index WHERE slug = ?").run("example-slug");
      await syncCasesToSQLite();
    } catch (err) {
      console.warn("sync example-slug failed (non-blocking)", err);
    }

    return payload;
  } catch (err) {
    console.error("ensure example case failed", err);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: any,
) {
  const { slug } = context.params;

  if (slug === "example-slug") {
    const created = await ensureExampleCase();
    if (created) return NextResponse.json(created, { status: 200 });
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const row = db.prepare("SELECT * FROM cases_index WHERE slug = ?").get(slug);

  if (!row) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const casePath = path.join(process.cwd(), "data", "cases", `${row.id}.json`);
  if (!fs.existsSync(casePath)) {
    return NextResponse.json({ error: "JSON file not found" }, { status: 404 });
  }

  const raw = fs.readFileSync(casePath, "utf-8");
  const json = JSON.parse(raw);

  return NextResponse.json(
    normalizeCase({
      ...(json as CaseRecord),
      visibility: (json as CaseRecord).visibility ?? (row as any).visibility,
      case_id: (row as any).case_id ?? (json as CaseRecord).case_id ?? 1,
      share_mode: (row as any).share_mode ?? (json as CaseRecord).share_mode ?? "private",
      share_token:
        (row as any).share_token ?? (json as CaseRecord).share_token ?? null,
    }),
    { status: 200 },
  );
}

export async function PUT(
  request: NextRequest,
  context: any,
) {
  try {
    const { slug } = context.params;
    const form = await request.formData();
    const date = (form.get("date") as string) || "";
    const time = (form.get("time") as string) || "";
    const titleInput = ((form.get("title") as string) || "").trim();
    const summaryInput = ((form.get("summary") as string) || "").trim();
    // 用 contentInput 即使為空字串也覆寫舊資料，才能清空內容
    const rawContent = form.get("content");
    const contentProvided = rawContent !== null;
    const contentInput = rawContent ? (rawContent as string).trim() : "";
    const visibilityInput = normalizeVisibility(
      (form.get("visibility") as string | null) as any,
    );
    const publicExcerpt = ((form.get("public_excerpt_zh") as string) || "").trim();
    const removedPhotos = JSON.parse(
      ((form.get("removedPhotos") as string) || "[]").toString(),
    ) as string[];
    const removedAttachments = JSON.parse(
      ((form.get("removedAttachments") as string) || "[]").toString(),
    ) as string[];

    if (!date || !time) {
      return NextResponse.json(
        { error: "缺少日期或時間" },
        { status: 400 },
      );
    }

    const row = db.prepare("SELECT * FROM cases_index WHERE slug = ?").get(slug);
    if (!row) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const casePath = path.join(process.cwd(), "data", "cases", `${row.id}.json`);
    const exists = fs.existsSync(casePath);
    const existing: CaseRecord = exists
      ? JSON.parse(fs.readFileSync(casePath, "utf-8"))
      : {} as any;

    const event_datetime = toIso(date, time);
    const summaryAuto =
      summaryInput ||
      (contentInput ? contentInput.slice(0, 120) : titleInput.slice(0, 120));
    const shortSentence = contentInput.split("\n")[0] || titleInput || summaryAuto;

    const baseDir = path.join(process.cwd(), "public", "images", "cases", slug);
    await fsp.mkdir(baseDir, { recursive: true });

    const photos = Array.isArray(existing.photos)
      ? existing.photos.filter(
          (p): p is string =>
            typeof p === "string" && !removedPhotos.includes(p),
        )
      : [];
    const attachments = Array.isArray(existing.attachments)
      ? existing.attachments.filter((a) => !removedAttachments.includes(a))
      : [];

    const files = form.getAll("files") as File[];
    let photoIndex = photos.length + 1;
    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue;
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || "";
      const isImage = /\.(png|jpe?g|webp|gif|bmp)$/i.test(ext);
      const baseName = isImage
        ? `${String(photoIndex).padStart(2, "0")}${ext || ".jpg"}`
        : file.name;
      const target = path.join(baseDir, baseName);
      await fsp.writeFile(target, buf);
      const publicPath = `/images/cases/${slug}/${baseName}`;
      if (isImage) {
        photos.push(publicPath);
        photoIndex++;
      } else {
        attachments.push(publicPath);
      }
    }

    const updated: CaseRecord = normalizeCase({
      ...existing,
      id: row.id,
      slug: row.slug || slug,
      event_datetime,
      recorded_at: existing.recorded_at || event_datetime,
      title: {
        zh:
          titleInput ||
          (typeof existing.title === "object"
            ? existing.title?.zh || existing.title?.en || existing.title_zh
            : existing.title_zh) ||
          null,
        en:
          typeof existing.title === "object"
            ? existing.title?.en ?? null
            : null,
      },
      short_sentence: {
        zh:
          shortSentence ||
          (typeof existing.short_sentence === "object"
            ? existing.short_sentence?.zh ||
              existing.short_sentence?.en ||
              existing.short_sentence_zh
            : existing.short_sentence_zh) ||
          null,
        en:
          typeof existing.short_sentence === "object"
            ? existing.short_sentence?.en ?? null
            : null,
      },
      summary: {
        zh:
          summaryAuto ||
          (typeof existing.summary === "object"
            ? existing.summary?.zh ||
              existing.summary?.en ||
              existing.summary_zh
            : existing.summary_zh) ||
          null,
        en:
          typeof existing.summary === "object"
            ? existing.summary?.en ?? null
            : null,
      },
      full_story: {
        zh:
          contentProvided
            ? contentInput
            : typeof existing.full_story === "object"
              ? existing.full_story?.zh ||
                existing.full_story?.en ||
                existing.full_story_zh ||
                existing.content_zh ||
                ""
              : existing.full_story_zh || existing.content_zh || "",
        en:
          typeof existing.full_story === "object"
            ? existing.full_story?.en ?? null
            : null,
      },
      content_zh: contentProvided
        ? contentInput
        : typeof existing.content === "object"
          ? existing.content?.zh || existing.content?.en || existing.content_zh || ""
          : existing.content_zh || "",
      tags: Array.isArray(existing.tags) ? existing.tags : [],
      photos,
      attachments,
      public_excerpt_zh: publicExcerpt || existing.public_excerpt_zh || "",
      visibility: visibilityInput,
      created_at: existing.created_at || existing.event_datetime || event_datetime,
      updated_at: new Date().toISOString(),
      data_version:
        typeof existing.data_version === "number"
          ? existing.data_version + 1
          : 1,
    });

    await fsp.writeFile(casePath, JSON.stringify(updated, null, 2), "utf8");

    try {
      await syncCasesToSQLite();
    } catch (err) {
      console.warn("sync to sqlite failed after update", err);
    }

    return NextResponse.json({ ok: true, id: row.id, slug });
  } catch (err: any) {
    console.error("update case error", err);
    return NextResponse.json(
      { error: err?.message || "更新失敗" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: any,
) {
  try {
    const { slug } = context.params;
    if (!slug) {
      return NextResponse.json({ error: "missing slug" }, { status: 400 });
    }

    const row = db.prepare("SELECT * FROM cases_index WHERE slug = ?").get(slug);
    const id = row?.id || slug;

    // delete json file
    const casePath = path.join(process.cwd(), "data", "cases", `${id}.json`);
    if (fs.existsSync(casePath)) {
      await fsp.unlink(casePath);
    }

    // delete images folder
    const imgDir = path.join(process.cwd(), "public", "images", "cases", slug);
    if (fs.existsSync(imgDir)) {
      await fsp.rm(imgDir, { recursive: true, force: true });
    }

    // delete db rows
    const delIndex = db.prepare("DELETE FROM cases_index WHERE slug = ?");
    const delTags = db.prepare("DELETE FROM tags_index WHERE case_id = ?");
    const delFts = db.prepare("DELETE FROM cases_fts WHERE id = ?");
    db.transaction(() => {
      delTags.run(id);
      delFts.run(id);
      delIndex.run(slug);
    })();

    return NextResponse.json({ ok: true, slug, id });
  } catch (err: any) {
    console.error("delete case error", err);
    return NextResponse.json(
      { error: err?.message || "刪除失敗" },
      { status: 500 },
    );
  }
}
