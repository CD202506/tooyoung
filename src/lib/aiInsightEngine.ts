type Input = {
  title: string;
  summary?: string;
  content?: string;
  tags?: string[];
  symptoms?: string[];
};

const riskMaps = [
  { keywords: ["迷路", "走失", "方向", "找不到"], risk: "高風險（走失傾向）", score: 80 },
  { keywords: ["忘記", "記錯", "重複"], risk: "中度風險（記憶退化可能影響安全）", score: 60 },
];

const careAdviceMaps: Array<{ tag: string; advice: string }> = [
  { tag: "emotional-shift", advice: "提供安撫與固定日常能降低焦慮。" },
  { tag: "ability-loss", advice: "需開始建立逐步協助方案。" },
  { tag: "lost", advice: "外出務必陪同，建立回家識別資訊。" },
];

function buildSummary(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= 140) return trimmed;
  return `${trimmed.slice(0, 140)}...`;
}

function chooseRisk(allText: string) {
  for (const map of riskMaps) {
    if (map.keywords.some((kw) => allText.includes(kw))) {
      return { risk: map.risk, score: map.score };
    }
  }
  return { risk: "低～中風險", score: 40 };
}

function buildKeywords(text: string, tags: string[]) {
  const matched = text.match(/[a-zA-Z\u4e00-\u9fa5]+/g) || [];
  const uniq = new Set<string>();
  matched.forEach((t) => {
    if (t.length > 1) uniq.add(t.toLowerCase());
  });
  tags.forEach((t) => uniq.add(t.toLowerCase()));
  return Array.from(uniq).slice(0, 10);
}

function buildSymptomShift(symptoms: string[] = []) {
  if (symptoms.includes("orientation") || symptoms.includes("memory")) {
    return "認知功能可能進入下一階段";
  }
  if (symptoms.includes("emotion") || symptoms.includes("emotional-shift")) {
    return "情緒波動需持續觀察";
  }
  return "暫無明顯變化";
}

export function buildAIInsight(input: Input) {
  const text = [input.title, input.summary, input.content].filter(Boolean).join(" ");
  const combined = text.toLowerCase();
  const { risk, score } = chooseRisk(combined);

  const adviceList: string[] = [];
  const tags = input.tags || [];
  const symptoms = input.symptoms || [];
  careAdviceMaps.forEach((map) => {
    if (tags.includes(map.tag) || symptoms.includes(map.tag)) {
      adviceList.push(map.advice);
    }
  });
  if (adviceList.length === 0) {
    adviceList.push("維持規律作息與陪伴，有助於穩定情緒與生活。");
  }

  return {
    ai_summary: buildSummary(text || input.title || ""),
    ai_risk: risk,
    ai_care_advice: adviceList.join("；"),
    ai_keywords: buildKeywords(text, tags),
    ai_score: score,
    ai_symptom_shift: buildSymptomShift(symptoms),
  };
}
