export type DemoTimelineItem = {
  id: string;
  caseId: string;
  date: string; // YYYY-MM-DD
  type: "event" | "symptom";
  title: string;
  note: string;
};

export const demoTimeline: DemoTimelineItem[] = [
  {
    id: "tl-001",
    caseId: "case-001",
    date: "2025-12-08",
    type: "event",
    title: "夜間迷路",
    note: "半夜起床找不到房間門，嘗試外出，被家人安撫。",
  },
  {
    id: "tl-002",
    caseId: "case-001",
    date: "2025-12-06",
    type: "symptom",
    title: "日夜顛倒",
    note: "凌晨精神亢奮、白天疲倦，嘗試調整作息。",
  },
  {
    id: "tl-003",
    caseId: "case-001",
    date: "2025-12-06",
    type: "event",
    title: "忘記用藥",
    note: "早上藥盒未開封，提醒後才服用。",
  },
  {
    id: "tl-004",
    caseId: "case-002",
    date: "2025-12-07",
    type: "event",
    title: "情緒激動",
    note: "傍晚因天黑產生不安，約 20 分鐘後緩和。",
  },
  {
    id: "tl-005",
    caseId: "case-003",
    date: "2025-12-05",
    type: "event",
    title: "跌倒擦傷",
    note: "浴室滑倒，輕微擦傷，已處理傷口。",
  },
  {
    id: "tl-006",
    caseId: "case-003",
    date: "2025-12-05",
    type: "symptom",
    title: "方向感不佳",
    note: "出門時多次停下確認方向，需陪伴。",
  },
  {
    id: "tl-007",
    caseId: "case-004",
    date: "2025-12-06",
    type: "symptom",
    title: "情緒起伏",
    note: "遇到陌生環境時焦慮，陪伴後改善。",
  },
  {
    id: "tl-008",
    caseId: "case-005",
    date: "2025-12-03",
    type: "symptom",
    title: "睡眠品質差",
    note: "夜間多次醒來，白天疲倦。",
  },
];
