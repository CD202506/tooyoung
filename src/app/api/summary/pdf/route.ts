export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCasesInRange } from "@/lib/caseQueries";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const pdfkitData = path.join(
      process.cwd(),
      "node_modules",
      "pdfkit",
      "js",
      "data",
    );
    if (fs.existsSync(pdfkitData)) {
      process.env.PDFKIT_DATA_PATH = pdfkitData;
    }

    const cases = await getCasesInRange(days);

    const fontPath = path.join(
      process.cwd(),
      "public",
      "fonts",
      "NotoSansTC-Regular.ttf",
    );

    if (!fs.existsSync(fontPath)) {
      console.error("字型不存在：", fontPath);
      throw new Error("Font file missing");
    }

    const { default: PDFDocument } = await import("pdfkit");
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      font: fontPath, // use custom font as default to avoid Helvetica.afm load
    });

    doc.registerFont("zh", fontPath);
    doc.font("zh");

    doc.fontSize(20).text(`最近 ${days} 天回診摘要`, { align: "center" });
    doc.moveDown();

    cases.forEach((c) => {
      doc
        .fontSize(14)
        .text(`${c.event_date ?? ""} - ${c.title_zh ?? ""}`, {
          underline: true,
        });
      doc.moveDown(0.3);
      doc.fontSize(12).text(c.summary_zh || "(無摘要)");
      doc.moveDown();
    });

    doc.end();

    const chunks: Buffer[] = [];
    for await (const chunk of doc) {
      chunks.push(chunk as Buffer);
    }

    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="summary-${days}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return new NextResponse("PDF generation failed", { status: 500 });
  }
}
