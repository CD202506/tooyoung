"use client";

import { useMemo, useState } from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { MockCaseStory } from "@/components/home/MockCaseStory";
import { AnonymousStats } from "@/components/home/AnonymousStats";
import { TrendPreview } from "@/components/home/TrendPreview";
import { CTASection } from "@/components/home/CTASection";
import { LanguageSwitcher } from "@/components/home/LanguageSwitcher";
import { getHomeDict, HomeLang } from "@/i18n/home";
import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

export default function HomePage() {
  const [lang, setLang] = useState<HomeLang>("zh");
  const dict = useMemo(() => getHomeDict(lang), [lang]);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[#0b0f1a] text-indigo-50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(88,106,255,0.12),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(165,110,255,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.1),transparent_35%)]" />
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:py-10">
          <div className="flex items-center justify-end">
            <LanguageSwitcher lang={lang} onChange={setLang} />
          </div>

          <HeroSection lang={lang} dict={dict} />

          <MockCaseStory lang={lang} title={dict.story_title} />

          <AnonymousStats lang={lang} title={dict.stats_title} />

          <TrendPreview lang={lang} title={dict.trend_title} />

          <CTASection dict={dict} lang={lang} />
        </div>
      </main>
      <Footer />
    </>
  );
}
