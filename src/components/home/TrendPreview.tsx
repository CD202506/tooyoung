import { HomeLang } from "@/i18n/home";

type Props = {
  lang: HomeLang;
  title: string;
};

const TREND = [
  { date: "Day 1", value: 12 },
  { date: "Day 7", value: 18 },
  { date: "Day 14", value: 22 },
  { date: "Day 21", value: 19 },
  { date: "Day 30", value: 26 },
];

export function TrendPreview({ lang, title }: Props) {
  const max = Math.max(...TREND.map((t) => t.value));
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="text-xs text-indigo-200">
          {lang === "zh" ? "模擬趨勢" : "Demo"}
        </span>
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        {TREND.map((item) => {
          const height = (item.value / max) * 100;
          return (
            <div key={item.date} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-gradient-to-t from-indigo-500 to-emerald-400 transition hover:shadow-lg"
                style={{ height: `${Math.max(height, 15)}px` }}
              />
              <div className="text-xs text-indigo-100">{item.date}</div>
              <div className="text-[11px] text-indigo-200">{item.value}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
