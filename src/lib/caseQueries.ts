import fs from "fs";
import path from "path";
import { normalizeCase } from "@/lib/normalizeCase";
import { CaseRecord } from "@/types/case";

function readAllCases(): CaseRecord[] {
  const dir = path.join(process.cwd(), "data", "cases");
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".json"));

  const cases: CaseRecord[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const parsed = JSON.parse(raw);
      const normalized = normalizeCase(parsed);
      const eventDate =
        normalized.event_date ||
        (normalized.event_datetime
          ? normalized.event_datetime.slice(0, 10)
          : undefined);

      cases.push({
        ...normalized,
        event_date: eventDate,
      });
    } catch (err) {
      console.warn("Failed to read case file", file, err);
    }
  }

  return cases;
}

export async function getCasesInRange(days: number): Promise<CaseRecord[]> {
  const all = readAllCases();
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  return all
    .filter((c) => {
      const dt = c.event_datetime || c.event_date;
      if (!dt) return false;
      const ts = new Date(dt).getTime();
      return !Number.isNaN(ts) && ts >= cutoff;
    })
    .sort(
      (a, b) =>
        new Date(b.event_datetime || b.event_date || 0).getTime() -
        new Date(a.event_datetime || a.event_date || 0).getTime(),
    );
}
