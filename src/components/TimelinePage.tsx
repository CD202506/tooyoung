import Link from "next/link";

export type TimelineEvent = {
  slug?: string;
  title?: string;
  summary?: string | null;
  event_datetime?: string | null;
  symptom_categories?: string[];
};

function formatDate(date?: string | null) {
  if (!date) return "未提供日期";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return date;
  return dt.toISOString().slice(0, 10);
}

export function TimelinePage({ events }: { events: TimelineEvent[] }) {
  return (
    <div className="space-y-6 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-neutral-900 md:text-xl">病程時間軸</h1>
        <p className="text-sm text-neutral-500">依日期倒序，最新事件在上方。</p>
      </div>

      {events.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
          尚無事件資料。
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[12px] top-0 h-full w-[2px] bg-neutral-300 md:left-[18px]" />
          <div className="space-y-14">
            {events.map((ev, idx) => (
              <div key={(ev.slug || "case") + idx} className="relative pl-8 md:pl-10">
                <span className="absolute left-0 top-1 h-3 w-3 rounded-full bg-neutral-300 md:left-[-1px]" />
                <div className="ml-2 rounded-md border border-neutral-100 bg-white p-5 shadow-sm md:ml-4">
                  <div className="text-[11px] font-semibold text-neutral-500 md:text-xs">
                    {formatDate(ev.event_datetime)}
                  </div>
                  <div className="text-base font-semibold text-neutral-900 md:text-lg">
                    {ev.title || "未命名事件"}
                  </div>
                  {ev.summary && (
                    <p className="mt-1 text-sm text-neutral-700">{ev.summary}</p>
                  )}
                  {(ev.symptom_categories?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {ev.symptom_categories?.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  {ev.slug && (
                    <Link
                      href={`/cases/${ev.slug}`}
                      className="mt-2 inline-flex text-xs font-semibold text-amber-700 hover:text-amber-800 md:text-sm"
                    >
                      查看事件 →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
