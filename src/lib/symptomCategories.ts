export type SymptomCategory = {
  id: string;
  labelZh: string;
  descriptionZh: string;
  keywords: string[];
  color?: string;
};

export const symptomCategories: SymptomCategory[] = [
  {
    id: "memory",
    labelZh: "記憶",
    descriptionZh: "與記憶衰退、忘記事項相關的情境",
    keywords: ["忘記", "記不得", "重複", "走失", "找不到"],
    color: "#a78bfa",
  },
  {
    id: "orientation",
    labelZh: "方向／時間感",
    descriptionZh: "辨識時間、日期、位置等定向感受",
    keywords: ["搞錯時間", "不知道今天", "認不得地方", "迷路", "跑錯"],
    color: "#60a5fa",
  },
  {
    id: "behavior",
    labelZh: "行為",
    descriptionZh: "衝動、固執、重複行為或不安全行為",
    keywords: ["亂動", "固執", "重複做", "不安全", "亂跑"],
    color: "#f87171",
  },
  {
    id: "emotion",
    labelZh: "情緒",
    descriptionZh: "情緒波動、焦慮、易怒、憂鬱等",
    keywords: ["生氣", "焦慮", "緊張", "哭", "憂鬱"],
    color: "#fbbf24",
  },
  {
    id: "sleep",
    labelZh: "睡眠",
    descriptionZh: "睡眠困難、作息混亂、夜間活動",
    keywords: ["失眠", "睡不好", "晚上醒來", "作息顛倒", "夜間"],
    color: "#34d399",
  },
  {
    id: "interaction",
    labelZh: "互動／社交",
    descriptionZh: "人際互動、社交退縮或誤解他人意圖",
    keywords: ["不理人", "拒絕溝通", "誤會", "生人", "社交"],
    color: "#38bdf8",
  },
  {
    id: "other",
    labelZh: "其他／未分類",
    descriptionZh: "無法歸類或其他特殊情境",
    keywords: [],
    color: "#9ca3af",
  },
];
