import { readOne } from "@/lib/db";

export async function getCase(slug: string) {
  if (!slug) return null; // 重要：避免 undefined

  try {
    const data = await readOne(slug);
    return data;
  } catch (e) {
    console.error("getCase() error:", e);
    return null;
  }
}
