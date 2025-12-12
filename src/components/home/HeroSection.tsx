import Link from "next/link";
import { HomeLang } from "@/i18n/home";

type HeroProps = {
  lang: HomeLang;
  dict: ReturnType<typeof import("@/i18n/home").getHomeDict>;
};

export function HeroSection({ lang, dict }: HeroProps) {
  const subtitle =
    lang === "zh"
      ? "TooYoung｜時空迷航雜記 · 科技陪伴照護"
      : "TooYoung | Tech-powered dementia companion";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-[#0d1027] via-[#0b1031] to-[#0b1c3a] p-8 shadow-xl md:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(77,119,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(134,78,255,0.18),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-200/80">
            TooYoung
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
            {dict.slogan}
          </h1>
          <p className="text-base text-indigo-100/80">{subtitle}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-700/30 transition hover:-translate-y-0.5 hover:bg-indigo-400"
            >
              {dict.cta_start}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-indigo-300/50 px-5 py-2.5 text-sm font-semibold text-indigo-100 hover:border-indigo-200 hover:bg-white/5"
            >
              {dict.cta_learn}
            </Link>
          </div>
        </div>
        <div className="relative mt-4 w-full max-w-sm md:mt-0">
          <div className="rounded-2xl border border-indigo-500/30 bg-white/5 p-4 shadow-lg backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-indigo-100/70">
              {lang === "zh" ? "模擬照護儀表板" : "Demo dashboard"}
            </div>
            <div className="mt-3 space-y-2 text-sm text-indigo-50/90">
              <div className="flex items-center justify-between">
                <span>{lang === "zh" ? "近期事件" : "Recent events"}</span>
                <span className="rounded-full bg-indigo-500/60 px-2 py-0.5 text-xs text-white">
                  12
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{lang === "zh" ? "量表同步" : "Scales synced"}</span>
                <span className="rounded-full bg-emerald-500/70 px-2 py-0.5 text-xs text-white">
                  MMSE / CDR
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{lang === "zh" ? "分享狀態" : "Sharing"}</span>
                <span className="rounded-full bg-amber-500/70 px-2 py-0.5 text-xs text-white">
                  Masked
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
