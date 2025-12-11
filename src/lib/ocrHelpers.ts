export function cleanOCRText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const cleaned = cleanOCRText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, " ");
  const tokens = cleaned.split(/\s+/).filter((t) => t.length > 1);
  return tokens.slice(0, 50);
}
