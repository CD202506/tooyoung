"use client";

import { CaregiverInfo } from "@/types/profile";

type Props = {
  value: CaregiverInfo[];
  onChange: (next: CaregiverInfo[]) => void;
};

export function CaregiverList({ value, onChange }: Props) {
  const handleUpdate = (index: number, key: keyof CaregiverInfo, val: string) => {
    const next = value.map((item, i) =>
      i === index ? { ...item, [key]: val } : item,
    );
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...value, { name: "", relation: "" }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <div className="text-sm text-neutral-400">目前尚未新增照護成員。</div>
      )}
      {value.map((item, idx) => (
        <div
          key={`${idx}-${item.name}-${item.relation}`}
          className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3"
        >
          <div className="mb-2 flex items-center justify-between text-sm text-neutral-200">
            <span>成員 #{idx + 1}</span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="text-xs text-red-300 hover:text-red-200"
            >
              移除
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>姓名</span>
              <input
                value={item.name}
                onChange={(e) => handleUpdate(idx, "name", e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                placeholder="姓名"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>關係</span>
              <input
                value={item.relation}
                onChange={(e) => handleUpdate(idx, "relation", e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                placeholder="例如：女兒、先生"
              />
            </label>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="rounded-md border border-blue-500 px-3 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
      >
        新增照護成員
      </button>
    </div>
  );
}
