import { normalizeProfile } from "@/lib/normalizeProfile";
import type { CaseProfile } from "@/types/profile";

const CACHE_TTL = 5 * 60 * 1000;
let cachedProfile: CaseProfile | null = null;
let cachedAt = 0;

export async function getProfileClient(force = false): Promise<CaseProfile> {
  const now = Date.now();
  if (!force && cachedProfile && now - cachedAt < CACHE_TTL) {
    return cachedProfile;
  }

  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
      : "";

  const res = await fetch(`${base}/api/profile`, { cache: "no-store" });
  const json = await res.json();
  if (!res.ok || !json?.ok || !json.profile) {
    throw new Error(json?.error || "Failed to load profile");
  }
  const normalized = normalizeProfile(json.profile as Partial<CaseProfile>);
  cachedProfile = normalized;
  cachedAt = now;
  return normalized;
}
