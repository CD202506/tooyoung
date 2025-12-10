import Link from "next/link";

type CaseCardProps = {
  slug: string;
  title_zh: string;
  short_sentence_zh: string;
  summary_zh: string;
  event_datetime: string;
};

export function CaseCard({
  slug,
  title_zh,
  short_sentence_zh,
  summary_zh,
  event_datetime,
}: CaseCardProps) {
  const date = new Date(event_datetime);
  const dateLabel = isNaN(date.getTime())
    ? event_datetime
    : date.toISOString().slice(0, 10).replace(/-/g, "/");

  return (
    <Link
      href={`/cases/${slug}`}
      className="mb-4 block w-full rounded-xl border border-secondary/30 bg-background p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="text-xs text-text/50">{dateLabel}</div>
      <h2 className="mt-3 text-lg font-semibold text-text">
        {title_zh}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-text">
        {short_sentence_zh}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text/70">
        {summary_zh}
      </p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition hover:text-indigo-700">
        閱讀全文 →
      </div>
    </Link>
  );
}
