import fs from "node:fs";
import path from "node:path";

export function getProfileFilePath() {
  return path.join(process.cwd(), "data", "profile", "profile.json");
}

export function ensureProfileFile(defaultPayload: Record<string, unknown> = {}) {
  const filePath = getProfileFilePath();
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      JSON.stringify(defaultPayload ?? {}, null, 2),
      "utf-8",
    );
  }
}
