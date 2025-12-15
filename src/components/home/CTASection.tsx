import Link from "next/link";
import { HomeLang } from "@/i18n/home";

type Props = {
  dict: ReturnType<typeof import("@/i18n/home").getHomeDict>;
  lang: HomeLang;
};

export function CTASection({ dict, lang }: Props) {
  const subtitle =
    lang === "zh"
      ? "開始收集事件、症狀與量表，準備下一次回診"
      : "Start logging events, symptoms, and scales for the next visit.";

  return (
    <section className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-800/60 via-indigo-700/60 to-indigo-600/60 p-6 text-white shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{dict.register}</h2>
          <p className="text-sm text-indigo-100/80">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-indigo-800 shadow-lg transition hover:-translate-y-0.5"
          >
            {dict.cta_start}
          </Link>
          <Link
            href="/cases"
            className="inline-flex items-center rounded-full border border-white/70 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            {dict.cta_learn}
          </Link>
        </div>
      </div>
    </section>
  );
}
