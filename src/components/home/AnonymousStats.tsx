import { HomeLang } from "@/i18n/home";

type Props = {
  lang: HomeLang;
  title: string;
};

const STATS = [
  { labelZh: "記憶/認知", labelEn: "Memory/Cognition", value: 42 },
  { labelZh: "行為/情緒", labelEn: "Behavior/Emotion", value: 28 },
  { labelZh: "睡眠/作息", labelEn: "Sleep/Routine", value: 16 },
  { labelZh: "安全/走失", labelEn: "Safety/Wandering", value: 9 },
];

export function AnonymousStats({ lang, title }: Props) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="text-xs text-indigo-200">Demo Data</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {STATS.map((stat) => {
          const label = lang === "zh" ? stat.labelZh : stat.labelEn;
          return (
            <div
              key={stat.labelZh}
              className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between text-sm text-indigo-100">
                <span>{label}</span>
                <span className="text-indigo-300">{stat.value}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-neutral-800">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${Math.min(stat.value, 50)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
