import { CaseEditForm } from "@/components/CaseEditForm";
import { notFound } from "next/navigation";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";

async function loadCase(slug: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/cases/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  const parsed = data as { case?: CaseRecord };
  return normalizeCase(parsed.case ?? (data as CaseRecord));
}

export default async function EditCasePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const item: CaseRecord | null = await loadCase(slug);
  if (!item) return notFound();

  const eventDatetime =
    item.event_datetime ||
    (item.event_date && item.event_time
      ? `${item.event_date}T${item.event_time}`
      : item.event_date) ||
    "";
  const date = eventDatetime ? eventDatetime.slice(0, 10) : "";
  const time = eventDatetime ? eventDatetime.slice(11, 16) : "";

  const title =
    typeof item.title === "object"
      ? item.title.zh || item.title.en || item.title_zh || ""
      : item.title || item.title_zh || "";

  const summary =
    typeof item.summary === "object"
      ? item.summary.zh || item.summary.en || item.summary_zh || ""
      : item.summary || item.summary_zh || "";

  const content =
    typeof item.full_story === "object"
      ? item.full_story.zh || item.full_story.en || ""
      : item.full_story ||
        item.full_story_zh ||
        (typeof item.content === "object"
          ? item.content.zh || item.content.en || ""
          : item.content || item.content_zh || "");

  return (
    <main className="mx-auto max-w-4xl px-5">
      <CaseEditForm
        slug={slug}
        initial={{
          date,
          time,
          title,
          summary,
          content,
          visibility: item.visibility,
          public_excerpt_zh: item.public_excerpt_zh ?? "",
          photos: Array.isArray(item.photos)
            ? item.photos
                .map((p) =>
                  typeof p === "string"
                    ? p
                    : p.filename
                      ? `/photos/${item.id}/${p.filename}`
                      : "",
                )
                .filter(Boolean)
            : [],
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
        }}
      />
    </main>
  );
}
