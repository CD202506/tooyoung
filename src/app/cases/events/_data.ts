export type DemoEvent = {
  id: string;
  caseId: string;
  date: string; // YYYY-MM-DD
  title: string;
  note: string;
  severity: "low" | "medium" | "high";
};

export const demoEvents: DemoEvent[] = [
  {
    id: "event-001",
    caseId: "case-001",
    date: "2025-12-08",
    title: "夜間迷路",
    note: "半夜起床找不到房間門，嘗試開大門外出，被家人發現並安撫。",
    severity: "medium",
  },
  {
    id: "event-002",
    caseId: "case-001",
    date: "2025-12-06",
    title: "忘記用藥",
    note: "早上藥盒未開封，提醒後才服用，需增加提醒頻率。",
    severity: "low",
  },
  {
    id: "event-003",
    caseId: "case-002",
    date: "2025-12-07",
    title: "情緒激動",
    note: "傍晚疑似因天黑產生不安，情緒升高約 20 分鐘，陪伴聊天後緩和。",
    severity: "medium",
  },
  {
    id: "event-004",
    caseId: "case-003",
    date: "2025-12-05",
    title: "跌倒擦傷",
    note: "浴室滑倒輕微擦傷，已處理傷口，需增加防滑措施與陪同。",
    severity: "high",
  },
  {
    id: "event-005",
    caseId: "case-003",
    date: "2025-12-04",
    title: "語言尋字困難",
    note: "與家人對話時頻繁停頓，尋找詞語時間變長，建議下次回診提及。",
    severity: "low",
  },
  {
    id: "event-006",
    caseId: "case-004",
    date: "2025-12-06",
    title: "重複購物",
    note: "同一天購買重複物品三次，疑似忘記已購買，建議協助管理購物清單。",
    severity: "medium",
  },
  {
    id: "event-007",
    caseId: "case-002",
    date: "2025-12-03",
    title: "短暫定向力喪失",
    note: "散步時一度找不到回家方向，約 5 分鐘後恢復，建議結伴出門。",
    severity: "high",
  },
  {
    id: "event-008",
    caseId: "case-005",
    date: "2025-12-02",
    title: "日夜顛倒",
    note: "凌晨精神亢奮、白天疲倦，嘗試調整作息與環境光線。",
    severity: "medium",
  },
];
