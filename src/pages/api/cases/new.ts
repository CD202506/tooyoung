import type { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import path from "path";
import slugify from "slugify";
import { syncCasesToSQLite } from "@/utils/syncCasesToSQLite";
import { CaseRecord } from "@/types/case";
import { normalizeVisibility } from "@/lib/caseVisibility";
import { detectEmotion, scoreSeverity } from "@/lib/emotionDetect";
import { buildAIInsight } from "@/lib/aiInsightEngine";

type CasePayload = CaseRecord & {
  id: string;
  slug: string;
  event_datetime: string;
  recorded_at: string;
  title: { zh: string | null; en: string | null };
  short_sentence: { zh: string | null; en: string | null };
  summary: { zh: string | null; en: string | null };
  full_story: { zh: string | null; en: string | null };
  tags: string[];
  photos: string[];
  attachments: string[];
  created_at: string;
  updated_at: string;
  data_version: number;
  emotion?: string;
  severity?: number;
  ai_summary?: string | null;
  ai_risk?: string | null;
  ai_care_advice?: string | null;
  ai_keywords?: string[];
  ai_score?: number | null;
  ai_symptom_shift?: string | null;
};

function buildId(date: string, time: string) {
  const safeDate = date.replace(/-/g, "-");
  const safeTime = time.replace(/:/g, "-");
  return `${safeDate}T${safeTime}-001`;
}

function toIso(date: string, time: string) {
  // assume local +08:00
  return `${date}T${time}:00+08:00`;
}

function toWebRequest(req: NextApiRequest) {
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0]?.trim() ||
    "http";
  const host = req.headers.host || "localhost";
  const url = `${proto}://${host}${req.url || ""}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "undefined") continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.append(key, value);
    }
  }

  const body =
    req.method === "GET" || req.method === "HEAD" ? undefined : (req as unknown as BodyInit);

  return new Request(
    url,
    {
      method: req.method,
      headers,
      body,
      duplex: "half", // Node 18+ requires duplex when sending a body (undici)
    } as RequestInit,
  );
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const form = await toWebRequest(req).formData();
    const date = (form.get("date") as string) || "";
    const time = (form.get("time") as string) || "";
    const title = ((form.get("title") as string) || "").trim();
    const content = ((form.get("content") as string) || "").trim();
    const summaryInput = ((form.get("summary") as string) || "").trim();
    const slugInput = ((form.get("slug") as string) || "").trim();
    const visibilityInput = normalizeVisibility(
      (form.get("visibility") as string | null) as any,
    );
    const publicExcerpt = ((form.get("public_excerpt_zh") as string) || "").trim();
    const tagsInput = (form.get("tags") as string) || "[]";
    let tags: string[] = [];
    try {
      const parsed = JSON.parse(tagsInput) as unknown;
      if (Array.isArray(parsed)) {
        tags = parsed.filter((t): t is string => typeof t === "string");
      }
    } catch {
      tags = [];
    }

    if (!date || !time) {
      return res.status(400).json({ error: "缺少日期或時間" });
    }

    const id = buildId(date, time);
    const slug =
      slugInput ||
      slugify(title || content.split("\n")[0] || id, {
        lower: true,
        strict: true,
      });

    const event_datetime = toIso(date, time);
    const recorded_at = event_datetime;

    // paths
    const baseDir = path.join(process.cwd(), "public", "images", "cases", slug);
    await fs.mkdir(baseDir, { recursive: true });

    const photos: string[] = [];
    const attachments: string[] = [];

    const files = form.getAll("files") as File[];
    let photoIndex = 1;
    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== "function") continue;
      const buf = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || "";
      const isImage = /.(png|jpe?g|webp|gif|bmp)$/i.test(ext);
      const baseName = isImage
        ? `${String(photoIndex).padStart(2, "0")}${ext || ".jpg"}`
        : file.name;
      const target = path.join(baseDir, baseName);
      await fs.writeFile(target, buf);
      const publicPath = `/images/cases/${slug}/${baseName}`;
      if (isImage) {
        photos.push(publicPath);
        photoIndex++;
      } else {
        attachments.push(publicPath);
      }
    }

    const summaryAuto =
      summaryInput ||
      (content ? content.slice(0, 120) : title ? title.slice(0, 120) : "");
    const emotion = detectEmotion(content);
    const severity = scoreSeverity(content);
    const ai = buildAIInsight({
      title: title || content.split("\n")[0] || "",
      summary: summaryAuto,
      content,
      tags,
      symptoms: [],
    });

    const payload: CasePayload = {
      id,
      slug,
      event_datetime,
      recorded_at,
      title: { zh: title || null, en: null },
      short_sentence: { zh: content.split("\n")[0] || null, en: null },
      summary: { zh: summaryAuto || null, en: null },
      full_story: { zh: content || null, en: null },
      tags,
      photos,
      attachments,
      created_at: event_datetime,
      updated_at: event_datetime,
      data_version: 1,
      module: "dementia",
      visibility: visibilityInput as CasePayload["visibility"],
      allow_photos_public: false,
      anonymization_level: "medium",
      public_excerpt_zh: publicExcerpt,
      emotion,
      severity,
      ai_summary: ai.ai_summary,
      ai_risk: ai.ai_risk,
      ai_care_advice: ai.ai_care_advice,
      ai_keywords: ai.ai_keywords,
      ai_score: ai.ai_score,
      ai_symptom_shift: ai.ai_symptom_shift,
    };

    // write JSON file
    const dataDir = path.join(process.cwd(), "data", "cases");
    await fs.mkdir(dataDir, { recursive: true });
    const filePath = path.join(dataDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");

    // optional: sync to SQLite so前端列表立即更新
    try {
      await syncCasesToSQLite();
    } catch (err) {
      console.warn("sync to sqlite failed, but file is saved", err);
    }

    return res.status(200).json({
      ok: true,
      id,
      slug,
      file: `/data/cases/${id}.json`,
    });
  } catch (err: any) {
    console.error("upload new case error", err);
    return res.status(500).json({ error: err?.message || "未知錯誤" });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  return handlePost(req, res);
}
