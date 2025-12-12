export type HomeLang = "zh" | "en";

const HOME_DICT = {
  zh: {
    slogan: "陪伴，是最好的照護",
    cta_start: "開始使用",
    cta_learn: "了解更多",
    stats_title: "最近常見的照護記錄（示意）",
    story_title: "模擬案例故事",
    trend_title: "30 天趨勢摘要（示意）",
    register: "開始建立你的家庭照護紀錄",
  },
  en: {
    slogan: "Companionship is the best care",
    cta_start: "Get Started",
    cta_learn: "Learn More",
    stats_title: "Common Recorded Symptoms (Demo)",
    story_title: "Sample Family Case Story",
    trend_title: "30-Day Trend Overview (Demo)",
    register: "Start Your Care Journey",
  },
} satisfies Record<HomeLang, Record<string, string>>;

export function getHomeDict(lang: HomeLang = "zh") {
  return HOME_DICT[lang] ?? HOME_DICT.zh;
}
