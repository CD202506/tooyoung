import { symptomCategories } from "@/lib/symptomCategories";

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
};

export function SymptomCategorySelector({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    const has = selected.includes(id);
    const next = has ? selected.filter((s) => s !== id) : [...selected, id];
    onChange(next);
  };

  return (
    <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <div className="flex items-center justify-between text-sm text-neutral-200">
        <span>症狀分類（可複選）</span>
        <span className="text-xs text-neutral-500">點擊 chips 增減分類</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {symptomCategories.map((cat) => {
          const active = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              aria-label={`symptom-${cat.id}`}
              onClick={() => toggle(cat.id)}
              className={`group flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? "border-blue-400 bg-blue-600/20 text-neutral-50 shadow-sm shadow-blue-500/30"
                  : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:border-blue-400 hover:bg-neutral-700"
              }`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: cat.color || "#f59e0b" }}
                aria-hidden
              />
              <span>{cat.labelZh || cat.name_zh}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
