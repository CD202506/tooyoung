import Link from "next/link";
import { getVisibilityLabel } from "@/lib/caseVisibility";

type TimelineCardProps = {
  id: string;
  slug: string;
  event_datetime: string;
  title_zh: string;
  summary_zh?: string;
  visibility?: string;
};

export function TimelineCard({
  slug,
  event_datetime,
  title_zh,
  summary_zh,
  visibility,
}: TimelineCardProps) {
  const date = new Date(event_datetime);
  const timeLabel = Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("zh-TW", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

  return (
    <div className="relative flex gap-4 pb-6">
      <div className="absolute left-[6px] top-[10px] h-full w-[2px] bg-neutral-800 dark:bg-neutral-700" />
      <div className="z-10 mt-1 h-3 w-3 rounded-full border-2 border-blue-400 bg-blue-500 shadow-sm" />
      <Link
        href={`/cases/${slug}`}
        className="group block w-full rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:border-blue-500 hover:bg-neutral-900"
      >
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span>{timeLabel}</span>
          <span className="inline-flex items-center rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200">
            {getVisibilityLabel(visibility as any)}
          </span>
        </div>
        <h3 className="mt-1 text-lg font-semibold text-neutral-50">
          {title_zh}
        </h3>
        {summary_zh && (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-300">
            {summary_zh}
          </p>
        )}
      </Link>
    </div>
  );
}
