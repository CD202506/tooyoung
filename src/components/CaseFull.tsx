type CaseFullProps = {
  title: { zh: string; en: string | null };
  event_datetime: string;
  full_story: { zh: string; en: string | null };
  tags: string[];
  clinical_links: unknown;
  medical_interpretation: { zh: string | null; en: string | null };
  care_advice: { zh: string | null; en: string | null };
};

export function CaseFull({
  title,
  event_datetime,
  full_story,
  tags,
  medical_interpretation,
  care_advice,
}: CaseFullProps) {
  const date = new Date(event_datetime);
  const dateLabel = isNaN(date.getTime())
    ? event_datetime
    : date.toISOString().slice(0, 16).replace("T", " ").replace(/-/g, "/");

  return (
    <article className="space-y-6 rounded-2xl bg-white p-4 text-zinc-900 shadow-sm sm:p-6 dark:bg-zinc-900 dark:text-zinc-50">
      <header className="space-y-2">
        <p className="text-sm text-text/50">{dateLabel}</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-primary">
          {title.zh}
        </h1>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/40 px-3 py-1 text-sm font-medium text-text/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="space-y-4 text-[1.05rem] leading-relaxed text-zinc-800 dark:text-zinc-100">
        {full_story.zh?.split("\n").map((para, idx) => (
          <p key={idx} className="whitespace-pre-wrap">
            {para}
          </p>
        ))}
      </section>

      {medical_interpretation.zh && (
        <section className="space-y-2 rounded-xl bg-amber-50 px-4 py-3 text-[16px] leading-7 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
          <h2 className="text-xl font-semibold text-accent">醫學解讀</h2>
          <p className="whitespace-pre-wrap">{medical_interpretation.zh}</p>
        </section>
      )}

      {care_advice.zh && (
        <section className="space-y-2 rounded-lg bg-secondary/20 p-4 text-[16px] leading-7 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
          <h2 className="text-xl font-semibold text-accent">照護建議</h2>
          <p className="whitespace-pre-wrap">{care_advice.zh}</p>
        </section>
      )}
    </article>
  );
}
