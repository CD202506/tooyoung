"use client";

import { FormEvent, useState } from "react";
import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

const TYPES = [
  { value: "general", zh: "一般詢問", en: "General" },
  { value: "partner", zh: "合作洽談", en: "Partnership" },
  { value: "medical", zh: "醫療專業", en: "Medical" },
  { value: "other", zh: "其他", en: "Other" },
];

export default function ContactPage() {
  const [message, setMessage] = useState<string>("");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("目前為示意表單，尚未啟用實際寄送功能。");
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Contact · 聯絡我們
            </div>
            <h1 className="text-3xl font-semibold">聯絡我們 · Contact Us</h1>
            <p className="text-sm text-gray-400">
              歡迎合作、醫療專業或一般詢問，暫不會實際寄送。
            </p>
          </header>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="text-sm text-gray-300">
                  姓名 / Name
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
                    name="name"
                    type="text"
                  />
                </label>
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  Email
                  <input
                    required
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
                    name="email"
                    type="email"
                  />
                </label>
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  類型 / Type
                  <select
                    name="type"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
                    defaultValue="general"
                  >
                    {TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.zh} / {t.en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div>
                <label className="text-sm text-gray-300">
                  訊息內容 / Message
                  <textarea
                    required
                    rows={4}
                    name="message"
                    className="mt-1 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
                    placeholder="請留下您的訊息 / Please leave your message"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
              >
                送出 / Submit
              </button>
            </form>
            {message && (
              <div className="mt-3 rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                {message}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
