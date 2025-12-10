"use client";

import { useMemo, useState } from "react";
import { CaseRecord } from "@/types/case";

type Props = {
  caseItem: CaseRecord;
};

function copyText(text: string, onDone: () => void) {
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(onDone).catch(onDone);
  } else {
    onDone();
  }
}

export function SharePreviewPanel({ caseItem }: Props) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dateLabel = useMemo(() => {
    if (!caseItem.event_datetime) return "";
    const d = new Date(caseItem.event_datetime);
    if (Number.isNaN(d.getTime())) return caseItem.event_datetime;
    return d.toLocaleString("zh-TW");
  }, [caseItem.event_datetime]);

  const tags = Array.isArray(caseItem.tags) ? caseItem.tags.join("、") : "";

  const clinicianText = useMemo(() => {
    const parts = [
      `日期時間：${dateLabel}`,
      `標題：${caseItem.title_zh || ""}`,
      `摘要：${caseItem.summary_zh || ""}`,
      tags ? `標籤：${tags}` : "",
    ].filter(Boolean);
    return parts.join("\n");
  }, [caseItem.summary_zh, caseItem.title_zh, dateLabel, tags]);

  const familyText = useMemo(() => {
    const short =
      caseItem.short_sentence_zh ||
      (caseItem.summary_zh ?? "").slice(0, 60);
    const parts = [
      `日期時間：${dateLabel}`,
      `標題：${caseItem.title_zh || ""}`,
      `重點：${short || ""}`,
    ].filter(Boolean);
    return parts.join("\n");
  }, [caseItem.short_sentence_zh, caseItem.summary_zh, caseItem.title_zh, dateLabel]);

  const publicText = useMemo(() => {
    const base = caseItem.public_excerpt_zh
      ? caseItem.public_excerpt_zh
      : (caseItem.short_sentence_zh || caseItem.summary_zh || "").slice(0, 80);
    const parts = [
      `日期：${caseItem.event_datetime?.slice(0, 10) || ""}`,
      base || "",
    ].filter(Boolean);
    return parts.join("\n");
  }, [caseItem.event_datetime, caseItem.public_excerpt_zh, caseItem.short_sentence_zh, caseItem.summary_zh]);

  const cards = [
    {
      key: "clinician",
      title: "🩺 醫護用",
      text: clinicianText,
    },
    {
      key: "family",
      title: "👨‍👩‍👧 家人用",
      text: familyText,
    },
    {
      key: "public",
      title: "🌱 公開分享",
      text: publicText,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-100">
              {card.title}
            </h3>
            <button
              type="button"
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-blue-500 hover:text-blue-400"
              onClick={() => {
                copyText(card.text, () => setCopiedKey(card.key));
                setTimeout(() => setCopiedKey(null), 1500);
              }}
            >
              複製
            </button>
          </div>
          <p className="mt-2 flex-1 whitespace-pre-line text-sm leading-relaxed text-neutral-200">
            {card.text || "（尚無內容）"}
          </p>
          {copiedKey === card.key && (
            <span className="mt-2 text-xs text-green-400">已複製</span>
          )}
        </div>
      ))}
    </div>
  );
}
