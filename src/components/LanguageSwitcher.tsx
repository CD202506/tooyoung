"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Language = "zh" | "en";

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("zh");

  useEffect(() => {
    const saved = window.localStorage.getItem("tooyoung_lang");
    if (saved === "zh" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem("tooyoung_lang", lang);
  };

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-2 py-1 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setLanguage("zh")}
        className={`rounded-full px-3 py-1 transition ${
          language === "zh"
            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        中文
      </button>
      <span className="text-zinc-300 dark:text-zinc-700">|</span>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 transition ${
          language === "en"
            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        }`}
      >
        English
      </button>
    </div>
  );
}
