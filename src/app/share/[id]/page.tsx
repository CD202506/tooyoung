"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { CaseProfile } from "@/types/profile";
import { PublicCase, PublicPhoto } from "@/lib/publicFilter";
import { buildClinicalSummary } from "@/lib/clinicalSummary";
import { maskSensitiveText, maskCaregiverLabel } from "@/lib/privacyMask";

type ShareResponse = {
  profile: CaseProfile;
  cases: PublicCase[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

function calcAge(birthYear?: number | null) {
  if (!birthYear || Number.isNaN(birthYear)) return "";
  const nowYear = new Date().getFullYear();
  const age = nowYear - birthYear;
  return age > 0 ? `${age} 歲` : "";
}

function formatDateTime(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrendList({ cases }: { cases: PublicCase[] }) {
  const [now] = useState(() => Date.now());
  const trend = useMemo(() => {
    const cutoff = now - 30 * DAY_MS;
    const counts = new Map<string, number>();
    for (const item of cases) {
      const dt = item.event_datetime || item.event_date;
      if (!dt) continue;
      const ts = new Date(dt).getTime();
      if (Number.isNaN(ts) || ts < cutoff) continue;
      const cats =
        Array.isArray(item.symptom_categories) &&
        item.symptom_categories.length > 0
          ? item.symptom_categories
          : ["未分類"];
      for (const cat of cats) {
        counts.set(cat, (counts.get(cat) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [cases, now]);

  const max = trend.reduce((acc, cur) => Math.max(acc, cur.count), 0);

  if (trend.length === 0) {
    return <div className="text-sm text-gray-500">最近 30 天沒有事件紀錄。</div>;
  }

  return (
    <div className="space-y-2">
      {trend.map((item) => {
        const barWidth = max ? Math.max((item.count / max) * 100, 8) : 0;
        return (
          <div
            key={item.label}
            className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white/70 p-3"
          >
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span>{item.label}</span>
              <span className="text-gray-500">{item.count}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ cases, masked }: { cases: PublicCase[]; masked: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (cases.length === 0) {
    return <div className="text-sm text-gray-500">目前沒有公開的事件。</div>;
  }

  return (
    <div className="space-y-3">
      {cases.map((item, idx) => {
        const isOpen = openIndex === idx;
        const photo: PublicPhoto | undefined =
          item.photos && item.photos.length > 0 ? item.photos[0] : undefined;
        const photoSrc = photo?.src ?? null;
        return (
          <button
            type="button"
            key={`${item.event_datetime}-${idx}`}
            onClick={() => setOpenIndex(isOpen ? null : idx)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDateTime(item.event_datetime)}</span>
                <span className="text-xs text-blue-500">{isOpen ? "收合" : "展開"}</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {masked ? maskSensitiveText(item.title_zh) || "未命名事件" : item.title_zh || "未命名事件"}
              </div>
              <div className="text-sm text-gray-700">
                {masked
                  ? maskSensitiveText(item.short_sentence_zh || item.summary_zh)
                  : item.short_sentence_zh || item.summary_zh || "(無摘要)"}
              </div>
              {photoSrc && (
                <div className="h-40 w-full overflow-hidden rounded-lg border border-gray-200">
                  <Image
                    src={photoSrc}
                    alt={photo.caption ?? item.title_zh ?? "photo"}
                    width={800}
                    height={450}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {isOpen && item.summary_zh && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                  {masked ? maskSensitiveText(item.summary_zh) : item.summary_zh}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function SharePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolved = typeof (params as Promise<{ id: string }>).then === "function"
    ? use(params as Promise<{ id: string }>)
    : (params as { id: string });
  const shareId = resolved.id ?? "default";
  const [data, setData] = useState<ShareResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/share/${shareId}`);
        if (res.status === 403) {
          setError("此頁面未公開");
          return;
        }
        if (!res.ok) {
          setError("無法載入分享頁");
          return;
        }
        const json = (await res.json()) as ShareResponse;
        setData(json);
      } catch (err) {
        console.error(err);
        setError("載入時發生錯誤");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [shareId]);

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-gray-900">
        <div className="mx-auto max-w-3xl">載入中…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-300 bg-white p-6 text-center text-sm text-gray-700">
          {error}
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { profile, cases } = data;
  if (profile.privacy_mode === "private") {
    return (
      <main className="min-h-screen bg-neutral-100 px-4 py-8 text-gray-900">
        <div className="mx-auto max-w-3xl rounded-lg border border-gray-300 bg-white p-6 text-center text-sm text-gray-700">
          此個案設定為私人模式，無法公開內容。
        </div>
      </main>
    );
  }

  const displayName =
    profile.privacy_mode === "masked" ? "匿名個案" : profile.display_name;
  const clinical = buildClinicalSummary(profile, cases, 60);
  const topSymptoms = clinical.topSymptoms.slice(0, 3);
  const notablePublic = clinical.recentNotableEvents.slice(0, 2);
  const caregivers = profile.caregivers ?? [];

  return (
    <main className="min-h-screen bg-neutral-100 px-4 py-8 text-gray-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 pb-12">
        {/* Header */}
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Public Case Profile
          </div>
          <div className="text-2xl font-semibold text-gray-900">{displayName}</div>
          <div className="text-gray-600">
            {calcAge(profile.birth_year) || "年齡未提供"} ·{" "}
            {profile.diagnosis_type || "診斷未提供"}
          </div>
          <div className="text-sm text-gray-500">
            此頁面由家屬授權公開，用於醫療與照護資訊交流
          </div>
          <div className="text-xs text-gray-500">
            個案分享模式：
            {profile.privacy_mode === "public"
              ? "公開"
              : profile.privacy_mode === "masked"
              ? "半匿名"
              : "私密"}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-2 text-lg font-semibold text-gray-900">
            最近 60 天病程摘要
          </div>
          <div className="mb-3 flex flex-wrap gap-2 text-sm text-gray-700">
            {topSymptoms.length === 0 && <span>尚無症狀統計</span>}
            {topSymptoms.map((s) => (
              <span
                key={s.symptom}
                className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
              >
                {s.symptom} · {s.count}
              </span>
            ))}
          </div>
          {notablePublic.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-semibold text-gray-800">需留意事件</div>
              {notablePublic.map((ev) => {
                const title =
                  typeof ev.title === "object"
                    ? ev.title?.zh ?? ev.title?.en ?? ""
                    : ev.title_zh ?? "";
                const short =
                  typeof ev.short_sentence === "object"
                    ? ev.short_sentence?.zh ?? ev.short_sentence?.en ?? ""
                    : ev.short_sentence_zh ?? "";
                const date = ev.event_datetime
                  ? new Date(ev.event_datetime).toLocaleDateString("zh-TW")
                  : "";
                const maskedTitle =
                  profile.privacy_mode === "masked" ? maskSensitiveText(title) : title;
                const maskedShort =
                  profile.privacy_mode === "masked" ? maskSensitiveText(short) : short;
                return (
                  <div
                    key={ev.slug || ev.event_datetime}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-left"
                  >
                    <div className="text-xs text-gray-500">{date}</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {maskedTitle || "未命名事件"}
                    </div>
                    <div className="text-xs text-gray-600">{maskedShort || "(無摘要)"}</div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">照護者</h3>
          <div className="space-y-2 text-sm text-gray-700">
            {caregivers.length === 0 && <div>未提供</div>}
            {caregivers.map((c, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                {profile.privacy_mode === "masked" ? maskCaregiverLabel(idx) : c.name}（
                {c.relation || "未填"}）
              </div>
            ))}
          </div>
        </section>

        {/* Trend */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-lg font-semibold text-gray-900">最近 30 天症狀分類</div>
          <TrendList cases={cases} />
        </section>

        {/* Timeline */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-lg font-semibold text-gray-900">事件列表</div>
          <Timeline cases={cases} masked={profile.privacy_mode === "masked"} />
        </section>
      </div>
    </main>
  );
}
