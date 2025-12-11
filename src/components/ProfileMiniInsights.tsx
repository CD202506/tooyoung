import { DashboardEvent } from "@/components/ProfileDashboard";
import { CaseRecord } from "@/types/case";
import { buildInsights } from "@/utils/insights";

type Props = {
  events: DashboardEvent[];
};

export function ProfileMiniInsights({ events }: Props) {
  const normalizedEvents: CaseRecord[] = events.map((ev) => ({
    slug: ev.slug,
    title: ev.title ? { zh: ev.title } : undefined,
    summary: ev.summary ? { zh: ev.summary } : undefined,
    event_datetime: ev.event_datetime ?? undefined,
    tags: ev.tags ?? [],
    symptom_categories: ev.symptom_categories ?? [],
  }));

  const insights = buildInsights(normalizedEvents);
  const maxDaily =
    Object.keys(insights.trend.daily).length > 0
      ? Math.max(...Object.values(insights.trend.daily))
      : 0;
  const maxByHour =
    Object.keys(insights.activity.byHour).length > 0
      ? Math.max(...Object.values(insights.activity.byHour))
      : 0;

  return (
    <section className="space-y-4">
      <h3 className="text-base font-semibold text-neutral-900 md:text-lg">Mini Insights</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Trend Card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-neutral-800">最近趨勢</div>
          <div className="text-xs text-neutral-500">近 30 天事件量：{insights.trend.total30}</div>
          <div className="text-xs text-neutral-500">近 7 天事件量：{insights.trend.last7}</div>
          <div className="space-y-1">
            {Object.entries(insights.trend.daily)
              .sort((a, b) => (a[0] > b[0] ? -1 : 1))
              .slice(0, 6)
              .map(([date, count]) => {
                const width = maxDaily > 0 ? (count / maxDaily) * 220 : 0;
                return (
                  <div key={date} className="flex items-center gap-2">
                    <span className="w-20 text-[11px] text-neutral-500">{date.slice(5)}</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-100">
                      <div
                        className="h-2 rounded-full bg-neutral-400"
                        style={{ width: `${width}px`, maxWidth: "220px" }}
                      />
                    </div>
                    <span className="w-6 text-right text-[11px] text-neutral-700">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Symptoms Card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-neutral-800">症狀熱度</div>
          <div className="text-xs text-neutral-500">Top 3 症狀分類</div>
          <div className="space-y-1.5">
            {insights.symptoms.topCategories.length === 0 ? (
              <div className="text-xs text-neutral-500">尚無資料</div>
            ) : (
              insights.symptoms.topCategories.map((item) => (
                <div key={item.category} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                  <span className="text-sm font-semibold text-neutral-900">{item.category}</span>
                  <span className="text-xs text-neutral-600">{item.count} 次</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Card */}
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
          <div className="text-sm font-semibold text-neutral-800">事件高峰時段</div>
          <div className="text-xs text-neutral-500">
            高峰：{insights.activity.peakHours.length > 0 ? insights.activity.peakHours.map((h) => `${h}:00`).join(", ") : "尚無資料"}
          </div>
          <div className="space-y-1">
            {Object.entries(insights.activity.byHour)
              .sort((a, b) => Number(a[0]) - Number(b[0]))
              .slice(0, 24)
              .map(([hour, count]) => {
                const width = maxByHour > 0 ? (count / maxByHour) * 200 : 0;
                return (
                  <div key={hour} className="flex items-center gap-2">
                    <span className="w-10 text-[11px] text-neutral-500">{hour.padStart(2, "0")}:00</span>
                    <div className="h-2 flex-1 rounded-full bg-neutral-100">
                      <div
                        className="h-2 rounded-full bg-neutral-400"
                        style={{ width: `${width}px`, maxWidth: "200px" }}
                      />
                    </div>
                    <span className="w-5 text-right text-[11px] text-neutral-700">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
