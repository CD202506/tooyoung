type SuggestInput = {
  title?: string;
  summary?: string;
  content?: string;
  ocrText?: string;
  symptoms?: string[];
};

const keywordMap: Array<{ keywords: string[]; tag: string }> = [
  { keywords: ["迷路", "走失", "找不到", "方向"], tag: "lost" },
  { keywords: ["認錯時間", "搞錯", "日期", "時間"], tag: "time-confusion" },
  { keywords: ["生氣", "崩潰", "恐慌", "擔心", "情緒"], tag: "emotional-shift" },
  { keywords: ["忘記", "記錯", "問很多次", "重複"], tag: "memory-decline" },
  { keywords: ["不會", "不懂怎麼", "不會使用", "做不到"], tag: "ability-loss" },
  { keywords: ["爭吵", "誤解", "衝突"], tag: "social-conflict" },
];

const symptomTagMap: Record<string, string> = {
  行為異常: "behavior",
  認知下降: "cognitive",
  失能: "function-loss",
};

export function suggestSmartTags(input: SuggestInput): string[] {
  const text =
    [
      input.title,
      input.summary,
      input.content,
      input.ocrText,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase() || "";

  const tags = new Set<string>();

  for (const map of keywordMap) {
    if (map.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      tags.add(map.tag);
    }
  }

  (input.symptoms || []).forEach((sym) => {
    const t = symptomTagMap[sym];
    if (t) tags.add(t);
  });

  return Array.from(tags);
}
