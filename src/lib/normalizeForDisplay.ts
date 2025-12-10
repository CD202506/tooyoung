import { CaseRecord } from "@/types/case";

export type DisplayPhoto = { src: string; caption?: string };

export type DisplayCase = CaseRecord & {
  displayShort: string;
  displayFull: string;
  photoBase: string;
  displayPhotos: DisplayPhoto[];
  galleryPhotos: { file: string; caption?: string }[];
};

function pickText(
  raw: CaseRecord,
  keys: Array<keyof CaseRecord | "content_fallback">,
): string {
  for (const key of keys) {
    if (key === "content_fallback") {
      const content =
        typeof raw.content === "object"
          ? raw.content?.zh || raw.content?.en || raw.content_zh
          : raw.content || raw.content_zh;
      if (content) return content;
      continue;
    }
    const val = raw[key];
    if (!val) continue;
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      // @ts-expect-error dynamic locale field
      const zh = val?.zh ?? val?.en;
      if (zh) return zh;
    }
  }
  return "";
}

export function normalizeForDisplay(raw: CaseRecord): DisplayCase {
  const photoBase = raw.id || raw.slug || "";
  const galleryPhotos = Array.isArray(raw.photos)
    ? raw.photos
        .map((p) => {
          if (typeof p === "string") return { file: p, caption: undefined };
          if (p?.file || p?.filename) {
            return { file: p.filename ?? p.file, caption: p.caption };
          }
          return null;
        })
        .filter((p): p is { file: string; caption?: string } => Boolean(p?.file))
    : [];

  const displayPhotos: DisplayPhoto[] =
    photoBase && galleryPhotos.length > 0
      ? galleryPhotos.map((p) => ({
          src: `/photos/${photoBase}/${p.file}`,
          caption: p.caption,
        }))
      : [];

  const fullText =
    pickText(raw, ["full_story", "full_story_zh", "summary", "summary_zh", "content_fallback"]) ||
    pickText(raw, ["short_sentence", "short_sentence_zh"]);

  const shortText =
    pickText(raw, ["short_sentence", "short_sentence_zh"]) ||
    fullText.slice(0, 30);

  const displayShort = shortText || fullText.slice(0, 30);
  const displayFull = fullText || shortText;

  return {
    ...raw,
    displayShort,
    displayFull,
    photoBase,
    displayPhotos,
    galleryPhotos,
  };
}
