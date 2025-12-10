import { CaseRecord } from "@/types/case";

export type PublicPhoto = { src: string; caption?: string };
export type PublicCase = Omit<CaseRecord, "id" | "slug" | "tags" | "photos"> & {
  photos?: PublicPhoto[];
};

type PublicPrivacy = {
  privacy_mode?: "public" | "masked" | "private";
  showTimeline?: boolean;
  showPhotos?: boolean;
};

export function publicFilterCases(
  cases: CaseRecord[],
  privacy: PublicPrivacy,
): PublicCase[] {
  const allowTimeline =
    privacy.showTimeline !== undefined
      ? privacy.showTimeline
      : privacy.privacy_mode !== "private";
  if (!allowTimeline) return [];

  const allowPhotos =
    privacy.showPhotos !== undefined
      ? privacy.showPhotos
      : privacy.privacy_mode === "public";

  return cases.map((item) => {
    const basePath = item.id ?? item.slug ?? "";
    const photos: PublicPhoto[] =
      allowPhotos && Array.isArray(item.photos) && basePath
        ? item.photos
            .filter((p) => Boolean((p as { filename?: string }).filename))
            .map((p) => ({
              src: `/photos/${basePath}/${(p as { filename: string }).filename}`,
              caption: (p as { caption?: string }).caption,
            }))
        : [];

    const publicCase: PublicCase = {
      ...(item as PublicCase),
      photos,
    };
    delete (publicCase as Record<string, unknown>).id;
    delete (publicCase as Record<string, unknown>).slug;
    delete (publicCase as Record<string, unknown>).tags;
    return publicCase;
  });
}
