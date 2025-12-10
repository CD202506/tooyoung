import { CaseItem } from "./types";

export function analyzeTrends(cases: CaseItem[]) {
  const now = Date.now();
  const days30 = now - 30 * 24 * 60 * 60 * 1000;
  const days7 = now - 7 * 24 * 60 * 60 * 1000;

  const stats30: Record<string, number> = {};
  const stats7: Record<string, number> = {};
  const firstAppearance: Record<string, string> = {};

  // 排序
  const sorted = [...cases].sort(
    (a, b) =>
      new Date(a.event_datetime).getTime() -
      new Date(b.event_datetime).getTime(),
  );

  for (const item of sorted) {
    const t = new Date(item.event_datetime).getTime();

    for (const tag of item.tags) {
      if (!firstAppearance[tag]) {
        firstAppearance[tag] = item.event_datetime.slice(0, 10);
      }

      if (!stats30[tag]) stats30[tag] = 0;
      if (!stats7[tag]) stats7[tag] = 0;

      if (t >= days30) stats30[tag]++;
      if (t >= days7) stats7[tag]++;
    }
  }

  // 趨勢分析
  const trendSummary: string[] = [];

  for (const tag of Object.keys(stats30)) {
    const c30 = stats30[tag] || 0;
    const c7 = stats7[tag] || 0;

    if (c7 > c30 * 0.6) {
      trendSummary.push(`${tag}: 最近 7 天增加（${c7} 次）`);
    } else if (c7 === 0) {
      trendSummary.push(`${tag}: 最近 7 天未觀察到`);
    } else {
      trendSummary.push(`${tag}: 穩定`);
    }
  }

  // 臨床敘述生成
  const clinicalLines: string[] = [];

  if (stats7["記憶缺失"] > (stats30["記憶缺失"] || 0) * 0.5) {
    clinicalLines.push("• 短期記憶退化加速，重複提問行為增加。");
  }

  if (stats7["語意混淆"] > 0) {
    clinicalLines.push("• 日常語意理解能力下降（如檔案、物品）。");
  }

  if (stats7["執行功能障礙"] > 0) {
    clinicalLines.push("• 任務維持能力減弱（購物、處理事情時容易偏離目標）。");
  }

  if (stats7["物品辨識困難"] === 1) {
    clinicalLines.push(
      "• 物品辨識困難首次出現，可能與語意記憶退化有關。",
    );
  }

  if (clinicalLines.length === 0) {
    clinicalLines.push("過去一週未見明顯惡化趨勢。");
  }

  return {
    stats30,
    stats7,
    firstAppearance,
    trendSummary,
    clinicalNarrative: clinicalLines.join("\n"),
  };
}
