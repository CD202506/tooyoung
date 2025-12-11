const positiveKeywords = ["開心", "順利", "改善", "安全", "平靜", "放心"];
const negativeKeywords = ["生氣", "吵架", "迷路", "忘記", "失控", "罵人", "過激", "害怕"];
const dangerKeywords = ["跌倒", "走失", "走丟", "失蹤", "急診", "報警", "火災"];

export function detectEmotion(text: string): "positive" | "neutral" | "negative" {
  const score = calcScore(text);
  if (score >= 1) return "positive";
  if (score <= -2) return "negative";
  return "neutral";
}

function calcScore(text: string): number {
  const lower = text || "";
  let score = 0;
  for (const kw of positiveKeywords) {
    if (lower.includes(kw)) score += 1;
  }
  for (const kw of negativeKeywords) {
    const re = new RegExp(kw, "g");
    const matches = lower.match(re);
    if (matches) score -= matches.length;
  }
  for (const kw of dangerKeywords) {
    if (lower.includes(kw)) score -= 3;
  }
  return score;
}

export function scoreSeverity(text: string): number {
  const lower = text || "";
  let score = 0;
  for (const kw of dangerKeywords) {
    if (lower.includes(kw)) score += 3;
  }
  let negativeCount = 0;
  for (const kw of negativeKeywords) {
    const re = new RegExp(kw, "g");
    const matches = lower.match(re);
    negativeCount += matches ? matches.length : 0;
  }
  score += negativeCount > 0 ? 1 : 0;
  if (lower.length > 200 && negativeCount > 0) score += 1;
  if (score < 0) score = 0;
  if (score > 5) score = 5;
  return score;
}

export function extractEmotionKeywords(text: string): string[] {
  const lower = text || "";
  const keywords: string[] = [];
  positiveKeywords.forEach((kw) => {
    if (lower.includes(kw)) keywords.push(kw);
  });
  negativeKeywords.forEach((kw) => {
    if (lower.includes(kw)) keywords.push(kw);
  });
  dangerKeywords.forEach((kw) => {
    if (lower.includes(kw)) keywords.push(kw);
  });
  return keywords;
}
