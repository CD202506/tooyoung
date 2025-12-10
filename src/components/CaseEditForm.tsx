"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { symptomCategories } from "@/lib/symptomCategories";
import { suggestCategoriesForCase } from "@/lib/symptomSuggest";

type FormState = {
  date: string;
  time: string;
  title: string;
  summary: string;
  content: string;
  files: File[];
  photos: string[];
  attachments: string[];
  removedPhotos: Set<string>;
  removedAttachments: Set<string>;
  visibility: "private" | "family" | "clinician" | "anonymized";
  public_excerpt_zh: string;
  symptom_categories: string[];
};

type Props = {
  slug: string;
  initial: Partial<FormState>;
};

const fallbackState: FormState = {
  date: "",
  time: "",
  title: "",
  summary: "",
  content: "",
  files: [],
  photos: [],
  attachments: [],
  removedPhotos: new Set<string>(),
  removedAttachments: new Set<string>(),
  visibility: "private",
  public_excerpt_zh: "",
  symptom_categories: [],
};

export function CaseEditForm({ slug, initial }: Props) {
  const [form, setForm] = useState<FormState>({
    ...fallbackState,
    ...initial,
    date: initial.date || "",
    time: initial.time || "",
    title: initial.title || "",
    summary: initial.summary || "",
    content: initial.content || "",
    files: [],
    photos: initial.photos || [],
    attachments: initial.attachments || [],
    removedPhotos: new Set<string>(),
    removedAttachments: new Set<string>(),
    visibility: initial.visibility || "private",
    public_excerpt_zh: (initial as { public_excerpt_zh?: string }).public_excerpt_zh || "",
    symptom_categories: Array.isArray((initial as { symptom_categories?: string[] }).symptom_categories)
      ? (initial as { symptom_categories?: string[] }).symptom_categories!
      : [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const buildTitleSummary = (text: string) => {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const flat = lines.join(" ");
    const firstLine = lines[0] || flat;
    const nextTitle = firstLine.slice(0, 10);
    const nextSummary = flat.slice(0, 50);
    return { nextTitle, nextSummary };
  };

  const generatedSummary = useMemo(() => {
    if (form.summary.trim()) return form.summary.trim();
    if (form.content.trim()) {
      return form.content.trim().slice(0, 120);
    }
    return "";
  }, [form.summary, form.content]);

  useEffect(() => {
    setMessage(null);
  }, [form.date, form.time, form.title, form.summary, form.content]);

  useEffect(() => {
    if (
      form.symptom_categories.length === 0 &&
      (initial as { symptom_categories?: string[] }).symptom_categories ===
        undefined
    ) {
      const suggested = suggestCategoriesForCase({
        title_zh: form.title,
        summary_zh: form.summary,
        short_sentence_zh: form.content.slice(0, 60),
        tags: (initial as { tags?: string[] }).tags,
      });
      if (suggested.length > 0) {
        setForm((prev) => ({ ...prev, symptom_categories: suggested }));
      }
    }
  }, [form.content, form.summary, form.title, form.symptom_categories.length, initial]);

  const autoGenerate = () => {
    const textSource =
      form.content.trim() ||
      form.summary.trim() ||
      form.title.trim();

    if (!textSource) {
      setMessage("沒有內容可用來產生標題/摘要，請先輸入內容或摘要");
      return;
    }

    const { nextTitle, nextSummary } = buildTitleSummary(textSource);

    setForm((prev) => ({
      ...prev,
      title: prev.title.trim() ? prev.title : nextTitle,
      summary: prev.summary.trim() ? prev.summary : nextSummary,
    }));
    setMessage("已自動產生標題/摘要，請確認後儲存");
  };

  const aiFromImages = async () => {
    if (form.files.length === 0 && !form.content.trim()) {
      setMessage("請先上傳圖片或輸入內容，再嘗試生成");
      return;
    }

    setSubmitting(true);
    setMessage("分析圖片/內容中...");
    try {
      const fd = new FormData();
      form.files.forEach((f) => fd.append("files", f, f.name));
      fd.append("text", form.content || form.summary || form.title || "");

      const res = await fetch("/api/vision/extract", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "OCR 失敗");
      }
      const data = (await res.json()) as { text?: string };
      const merged = `${form.content}\n${data.text || ""}`.trim();
      if (!merged) {
        setMessage("未從圖片取得文字，請確認圖片內容是否清晰");
        return;
      }
      const { nextTitle, nextSummary } = buildTitleSummary(merged);
      setForm((prev) => ({
        ...prev,
        title: prev.title.trim() ? prev.title : nextTitle,
        summary: prev.summary.trim() ? prev.summary : nextSummary,
        content: prev.content || merged,
      }));
      setMessage("已根據圖片/內容生成標題與摘要");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "影像分析失敗，請稍後再試";
      setMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleRemovePhoto = (url: string) => {
    setForm((prev) => {
      const next = new Set(prev.removedPhotos);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return { ...prev, removedPhotos: next };
    });
  };

  const toggleRemoveAttachment = (url: string) => {
    setForm((prev) => {
      const next = new Set(prev.removedAttachments);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return { ...prev, removedAttachments: next };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    setForm((prev) => ({ ...prev, files: Array.from(list) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.time) {
      setMessage("請填寫日期與時間");
      return;
    }
    if (
      !form.title.trim() &&
      !form.summary.trim() &&
      !form.content.trim() &&
      form.files.length === 0
    ) {
      setMessage("請至少填寫標題/摘要/內容其中一項，或上傳檔案");
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
      fd.append(
        "removedPhotos",
        JSON.stringify(Array.from(form.removedPhotos)),
      );
      fd.append(
        "removedAttachments",
        JSON.stringify(Array.from(form.removedAttachments)),
      );
      fd.append("visibility", form.visibility);
      fd.append("public_excerpt_zh", form.public_excerpt_zh);
      fd.append(
        "symptom_categories",
        JSON.stringify(form.symptom_categories || []),
      );
      form.files.forEach((f) => fd.append("files", f, f.name));

      const res = await fetch(`/api/cases/${slug}`, {
        method: "PUT",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "更新失敗");
      }

      setMessage("更新成功！已同步儲存，準備返回案件頁面...");
      router.push(`/cases/${slug}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "發生錯誤，請稍後再試";
      setMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="content py-10 text-neutral-100">
      <div className="mb-4 flex items-center gap-3 text-sm text-blue-400">
        <Link href={`/cases/${slug}`} className="underline hover:text-blue-300">
          返回案件
        </Link>
        <span className="opacity-70">/</span>
        <span className="opacity-70">編輯</span>
      </div>

      <h1 className="mb-6 text-3xl font-semibold text-neutral-100">
        編輯案件
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
          標題
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
              placeholder="例：她說這裡是家"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <button
              type="button"
              onClick={autoGenerate}
              className="shrink-0 rounded border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
            >
              AI 生成
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          摘要（若空會自動以內容前 120 字生成）
          <textarea
            className="min-h-[80px] rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            value={form.summary}
            onChange={(e) => {
              const value = e.target.value;
              setForm((prev) => {
                const nextTitle =
                  prev.title.trim() || !value.trim()
                    ? prev.title
                    : value.trim().slice(0, 20);
                return { ...prev, summary: value, title: nextTitle };
              });
            }}
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

        <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
          <div className="flex items-center justify-between text-sm text-neutral-200">
            <span>症狀類別（可複選）</span>
            <span className="text-xs text-neutral-500">
              以下為系統依內容自動建議的類別，你可以自行增減。
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {symptomCategories.map((cat) => {
              const active = form.symptom_categories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setForm((prev) => {
                      const next = active
                        ? prev.symptom_categories.filter((c) => c !== cat.id)
                        : [...prev.symptom_categories, cat.id];
                      return { ...prev, symptom_categories: next };
                    })
                  }
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    active
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-neutral-700 bg-neutral-800 text-neutral-200 hover:border-blue-500 hover:text-blue-400"
                  }`}
                >
                  {cat.labelZh}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          內容（可直接輸入對話紀錄）
          <textarea
            className="min-h-[160px] rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-100"
            placeholder="內容..."
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </label>

        {(form.photos.length > 0 || form.attachments.length > 0) && (
          <div className="space-y-3 rounded border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-200">
            <div className="font-semibold text-neutral-100">已存在的檔案</div>
            {form.photos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">照片</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {form.photos.map((url) => {
                    const marked = form.removedPhotos.has(url);
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => toggleRemovePhoto(url)}
                        className={`flex h-24 items-center justify-center rounded border px-2 text-xs transition ${
                          marked
                            ? "border-red-500/70 bg-red-500/10 text-red-200"
                            : "border-neutral-700 bg-neutral-800 hover:border-blue-500"
                        }`}
                        title={url}
                      >
                        {marked ? "已標記刪除" : "保留"} | {url.split("/").pop()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {form.attachments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">附件</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {form.attachments.map((url) => {
                    const marked = form.removedAttachments.has(url);
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => toggleRemoveAttachment(url)}
                        className={`flex items-center justify-between rounded border px-3 py-2 text-xs transition ${
                          marked
                            ? "border-red-500/70 bg-red-500/10 text-red-200"
                            : "border-neutral-700 bg-neutral-800 hover:border-blue-500"
                        }`}
                        title={url}
                      >
                        <span className="truncate">{url.split("/").pop()}</span>
                        <span className="pl-2 text-[10px]">
                          {marked ? "刪除" : "保留"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <label className="flex flex-col gap-2 text-sm text-neutral-300">
          新增照片 / 附件（會附加到原有列表）
          <input
            type="file"
            name="files"
            multiple
            onChange={handleFileChange}
            className="text-neutral-200 cursor-pointer"
            accept="image/*,.pdf,.txt"
          />
          {form.files.length > 0 && (
            <div className="text-xs text-neutral-400">
              已選取 {form.files.length} 個檔案
            </div>
          )}
        </label>

        {message && (
          <div className="rounded border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-yellow-300">
            {message}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={autoGenerate}
            className="rounded border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
            disabled={submitting}
          >
            文字生成標題/摘要
          </button>
          <button
            type="button"
            onClick={aiFromImages}
            className="rounded border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400 disabled:opacity-60"
            disabled={submitting}
          >
            圖片 OCR 生成
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {submitting ? "儲存中..." : "儲存修改"}
        </button>
      </form>

      <div className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
        <p className="text-sm text-neutral-400">預覽</p>
        <h2 className="mt-2 text-2xl font-semibold text-neutral-100">
          {form.title || form.content.split("\n")[0] || "（尚未填寫標題）"}
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          {form.date} {form.time}
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
            新增檔案列表：
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
