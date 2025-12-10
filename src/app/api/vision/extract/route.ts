import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];
    const textInput = ((form.get("text") as string) || "").trim();

    if ((!files || files.length === 0) && !textInput) {
      return NextResponse.json(
        { error: "缺少圖片或文字" },
        { status: 400 },
      );
    }

    // If you have an external OCR endpoint, set VISION_API_URL and forward there.
    const visionApiUrl = process.env.VISION_API_URL;
    if (visionApiUrl && files.length > 0) {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f, f.name));
      if (textInput) fd.append("text", textInput);

      const resp = await fetch(visionApiUrl, {
        method: "POST",
        body: fd,
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || "OCR service failed");
      }
      const data = await resp.json();
      return NextResponse.json({ text: data.text || "", from: "external" });
    }

    // Fallback: no OCR service configured, just echo provided text.
    const combined =
      textInput ||
      files.map((f) => f.name).join(" "); // minimal fallback with file names

    return NextResponse.json({
      text: combined,
      from: "fallback-no-vision-service",
    });
  } catch (err: any) {
    console.error("vision extract error", err);
    return NextResponse.json(
      { error: err?.message || "影像解析失敗" },
      { status: 500 },
    );
  }
}
