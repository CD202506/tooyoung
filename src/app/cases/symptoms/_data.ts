export type DemoSymptom = {
  id: string;
  caseId: string;
  name: string;
  frequency: "rare" | "sometimes" | "often";
  severity: "low" | "medium" | "high";
  lastObserved: string; // YYYY-MM-DD
};

export const demoSymptoms: DemoSymptom[] = [
  {
    id: "symptom-001",
    caseId: "case-001",
    name: "記憶力下降",
    frequency: "often",
    severity: "medium",
    lastObserved: "2025-12-08",
  },
  {
    id: "symptom-002",
    caseId: "case-001",
    name: "日夜顛倒",
    frequency: "sometimes",
    severity: "low",
    lastObserved: "2025-12-06",
  },
  {
    id: "symptom-003",
    caseId: "case-002",
    name: "重複提問",
    frequency: "often",
    severity: "medium",
    lastObserved: "2025-12-07",
  },
  {
    id: "symptom-004",
    caseId: "case-003",
    name: "方向感不佳",
    frequency: "sometimes",
    severity: "high",
    lastObserved: "2025-12-05",
  },
  {
    id: "symptom-005",
    caseId: "case-003",
    name: "語言尋字困難",
    frequency: "rare",
    severity: "low",
    lastObserved: "2025-12-04",
  },
  {
    id: "symptom-006",
    caseId: "case-004",
    name: "情緒起伏",
    frequency: "sometimes",
    severity: "medium",
    lastObserved: "2025-12-06",
  },
  {
    id: "symptom-007",
    caseId: "case-005",
    name: "睡眠品質差",
    frequency: "often",
    severity: "medium",
    lastObserved: "2025-12-03",
  },
  {
    id: "symptom-008",
    caseId: "case-005",
    name: "嗅味覺變化",
    frequency: "rare",
    severity: "low",
    lastObserved: "2025-12-02",
  },
];
