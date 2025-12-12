import { HomeLang } from "@/i18n/home";

type Props = {
  lang: HomeLang;
  onChange: (lang: HomeLang) => void;
};

export function LanguageSwitcher({ lang, onChange }: Props) {
  const options: { value: HomeLang; label: string }[] = [
    { value: "zh", label: "繁體中文" },
    { value: "en", label: "English" },
  ];

  return (
    <div className="flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-900/40 px-2 py-1 text-xs text-indigo-100 shadow-sm">
      {options.map((opt) => {
        const active = opt.value === lang;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3 py-1 transition ${
              active
                ? "bg-white text-indigo-900 shadow"
                : "text-indigo-100 hover:bg-white/10"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
