import { NextResponse } from "next/server";
import { cleanOCRText, extractKeywords } from "@/lib/ocrHelpers";
import { suggestCategoriesForCase } from "@/lib/symptomSuggest";
import { detectEmotion, scoreSeverity, extractEmotionKeywords } from "@/lib/emotionDetect";

export const runtime = "nodejs";

function generateTitle(raw: string) {
  const cleaned = cleanOCRText(raw);
  if (!cleaned) return "";
  const firstLine = cleaned.split("\n")[0] || cleaned;
  return firstLine.slice(0, 16);
}

function generateSummary(raw: string) {
  const cleaned = cleanOCRText(raw);
  if (!cleaned) return "";
  const max = 120;
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max)}...`;
}

async function callExternalOCR(file: File, textInput: string) {
  const visionApiUrl = process.env.VISION_API_URL;
  if (!visionApiUrl) return null;
  const fd = new FormData();
  fd.append("file", file, file.name);
  if (textInput) fd.append("text", textInput);

  const resp = await fetch(visionApiUrl, {
    method: "POST",
    body: fd,
  });
  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(msg || "OCR service failed");
  }
  const data = (await resp.json()) as { text?: string };
  return data.text || "";
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const textInput = ((form.get("text") as string) || "").trim();

    if (!file && !textInput) {
      return NextResponse.json({ ok: false, error: "缺少圖片或文字" }, { status: 400 });
    }

    let rawText = "";
    try {
      if (file) {
        const external = await callExternalOCR(file, textInput);
        if (external !== null) {
          rawText = external;
        }
      }
    } catch (err) {
      console.warn("external OCR failed, fallback to text", err);
    }

    if (!rawText) {
      rawText =
        textInput ||
        (file ? `圖片：${file.name}` : "");
    }

    const cleaned = cleanOCRText(rawText);
    const title = generateTitle(cleaned);
    const summary = generateSummary(cleaned);
    const keywords = extractKeywords(cleaned).join(" ");
    const suggestions = suggestCategoriesForCase({
      title_zh: title,
      summary_zh: summary,
      short_sentence_zh: keywords,
    } as any);

    return NextResponse.json({
      ok: true,
      raw_text: cleaned,
      summary,
      title,
      suggestions: {
        symptom_categories: suggestions,
      },
      emotion: detectEmotion(cleaned),
      severity: scoreSeverity(cleaned),
      emotion_keywords: extractEmotionKeywords(cleaned),
    });
  } catch (err: unknown) {
    console.error("vision extract error", err);
    const message = err instanceof Error ? err.message : "影像解析失敗";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
