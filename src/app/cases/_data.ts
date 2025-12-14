export type DemoCase = {
  id: string;
  name: string;
  relation: string;
  status: string;
  updatedAt: string;
};

export const demoCases: DemoCase[] = [
  { id: "case-001", name: "個案 A", relation: "母親", status: "觀察中", updatedAt: "2025-12-01" },
  { id: "case-002", name: "個案 B", relation: "父親", status: "評估中", updatedAt: "2025-12-03" },
  { id: "case-003", name: "個案 C", relation: "本人", status: "確診後追蹤", updatedAt: "2025-12-05" },
  { id: "case-004", name: "個案 D", relation: "家人", status: "觀察中", updatedAt: "2025-12-06" },
  { id: "case-005", name: "個案 E", relation: "母親", status: "評估中", updatedAt: "2025-12-07" },
  { id: "case-006", name: "個案 F", relation: "父親", status: "觀察中", updatedAt: "2025-12-08" },
  { id: "case-007", name: "個案 G", relation: "本人", status: "確診後追蹤", updatedAt: "2025-12-09" },
  { id: "case-008", name: "個案 H", relation: "家人", status: "觀察中", updatedAt: "2025-12-10" },
];
