import { HomeLang } from "@/i18n/home";

type Props = {
  lang: HomeLang;
  title: string;
};

const STORIES = {
  zh: [
    {
      title: "媽媽再次忘記回家的路",
      detail: "傍晚散步時迷路，透過社區志工協助平安返家。",
      tag: "方向感",
    },
    {
      title: "睡眠日夜顛倒",
      detail: "凌晨兩點起床整理衣物，家人需要輪流陪伴。",
      tag: "睡眠",
    },
  ],
  en: [
    {
      title: "Mom got lost on her way home",
      detail: "Evening walk turned into wandering; neighbors helped her return safely.",
      tag: "Orientation",
    },
    {
      title: "Sleep schedule flipped",
      detail: "Woke at 2 AM sorting clothes; family now rotates night shifts.",
      tag: "Sleep",
    },
  ],
} satisfies Record<HomeLang, { title: string; detail: string; tag: string }[]>;

export function MockCaseStory({ lang, title }: Props) {
  const data = STORIES[lang];
  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <span className="rounded-full border border-indigo-400/50 px-3 py-1 text-xs text-indigo-100">
          Demo
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {data.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 shadow-sm transition hover:border-indigo-500/60"
          >
            <div className="flex items-center justify-between text-sm text-indigo-200">
              <span className="rounded-full bg-indigo-500/30 px-2 py-0.5 text-xs text-indigo-50">
                {item.tag}
              </span>
              <span className="text-[11px] text-indigo-100/70">Story</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-indigo-100/80">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
