"use client";

import { useEffect, useMemo, useState } from "react";
import slugify from "slugify";

type FormState = {
  date: string;
  time: string;
  title: string;
  summary: string;
  content: string;
  files: File[];
  visibility: "private" | "family" | "clinician" | "anonymized";
   public_excerpt_zh: string;
};

const initialState: FormState = {
  date: "",
  time: "",
  title: "",
  summary: "",
  content: "",
  files: [],
  visibility: "private",
   public_excerpt_zh: "",
};

export default function NewCasePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slug = useMemo(() => {
    if (form.title.trim()) {
      return slugify(form.title, { lower: true, strict: true });
    }
    return "";
  }, [form.title]);

  const generatedSummary = useMemo(() => {
    if (form.summary.trim()) return form.summary.trim();
    if (form.content.trim()) {
      return form.content.trim().slice(0, 120);
    }
    return "";
  }, [form.summary, form.content]);

  useEffect(() => {
    setMessage(null);
  }, [form]);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    setForm((prev) => ({
      ...prev,
      date: prev.date || `${y}-${m}-${d}`,
      time: prev.time || `${hh}:${mm}`,
    }));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setForm((prev) => ({ ...prev, files: Array.from(list) }));
  };

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const nextTitle =
        prev.title.trim() || !value.trim()
          ? prev.title
          : value.trim().slice(0, 20);
      return { ...prev, summary: value, title: nextTitle };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      setMessage("請填寫日期與時間");
      return;
    }
    if (!form.title.trim() && !form.content.trim()) {
      setMessage("請至少填寫標題或內容");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("date", form.date);
      fd.append("time", form.time);
      fd.append("title", form.title || form.content.split("\n")[0] || "");
      fd.append("summary", generatedSummary);
      fd.append("content", form.content);
      fd.append("slug", slug);
      fd.append("visibility", form.visibility);
      fd.append("public_excerpt_zh", form.public_excerpt_zh);
      form.files.forEach((f) => fd.append("files", f, f.name));

      const res = await fetch("/api/cases/new", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "上傳失敗");
      }
      setMessage("✅ 新增成功！已儲存並同步。");
      setForm(initialState);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "發生錯誤";
      setMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content py-10 text-neutral-100">
      <h1 className="mb-6 text-3xl font-semibold text-neutral-100">
        新增案例（上傳圖片 / 檔案）
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900 p-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            日期
            <input
              type="date"
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-neutral-300">
            時間
            <input
              type="time"
              className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          標題（預設為對話第一句，可留空）
          <input
            type="text"
            className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            placeholder="例如：她問我這是哪裡？"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          摘要（若留空，系統會以內容前 120 字自動生成）
          <textarea
            className="min-h-[80px] rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            value={form.summary}
            onChange={handleSummaryChange}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          公開用精簡敘述（可匿名，可選填）
          <textarea
            className="min-h-[80px] rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            placeholder="用於分享給其他照護者或社群的版本，不會自動上傳。"
            value={form.public_excerpt_zh}
            onChange={(e) =>
              setForm({ ...form, public_excerpt_zh: e.target.value })
            }
          />
          <span className="text-xs text-neutral-500">
            說明：這段文字是你打算分享給其他照護者或社團的版本，僅供複製使用。
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          隱私層級
          <select
            value={form.visibility}
            onChange={(e) =>
              setForm({
                ...form,
                visibility: e.target.value as FormState["visibility"],
              })
            }
            className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
          >
            <option value="private">🔒 僅自己</option>
            <option value="family">👨‍👩‍👧 家人</option>
            <option value="clinician">🩺 醫療團隊</option>
            <option value="anonymized">🌐 匿名分享</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          內容（可用一問一答、對話方式輸入）
          <textarea
            className="min-h-[160px] rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            placeholder="梅：...\n我：..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          上傳圖片 / 檔案（可多選）
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="text-neutral-200"
          />
          {form.files.length > 0 && (
            <div className="text-xs text-neutral-400">
              已選擇：{form.files.length} 檔
            </div>
          )}
        </label>

        {message && (
          <div className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-yellow-300">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {submitting ? "上傳中..." : "儲存並預覽"}
        </button>
      </form>

      {/* 預覽區 */}
      <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <p className="text-sm text-neutral-400">預覽（不影響送出）</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-100">
          {form.title || form.content.split("\n")[0] || "（尚未填寫標題）"}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {form.date} {form.time} | slug: {slug || "（送出時產生）"}
        </p>
        <p className="mt-4 text-base leading-relaxed text-neutral-200">
          {generatedSummary || "（將以內容前 120 字自動生成摘要）"}
        </p>
        {form.content && (
          <pre className="mt-3 whitespace-pre-line text-neutral-200">
            {form.content}
          </pre>
        )}
        {form.files.length > 0 && (
          <div className="mt-3 text-sm text-neutral-300">
            檔案列表：
            <ul className="list-disc pl-5">
              {form.files.map((f) => (
                <li key={f.name}>
                  {f.name} ({Math.round(f.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
