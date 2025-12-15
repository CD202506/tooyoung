"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { CaseRecord } from "@/types/case";
import { CaseProfile } from "@/types/profile";
import { ClinicalSummary } from "@/lib/clinicalSummary";
import { getProfileClient } from "@/lib/getProfileClient";
import { maskCaregiverLabel } from "@/lib/privacyMask";
import { ClinicalScaleRecord } from "@/types/clinicalScale";

type TrendItem = { label: string; count: number };

const DAY_MS = 24 * 60 * 60 * 1000;
const MVP_OPEN = process.env.NEXT_PUBLIC_MVP_OPEN === "1";

function calcAgeFromYear(birthYear?: number | null) {
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

export default function DashboardPage() {
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [clinical, setClinical] = useState<ClinicalSummary | null>(null);
  const [latestScales, setLatestScales] = useState<ClinicalScaleRecord[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // MVP 開放模式：跳過所有 auth/session 相關呼叫
        if (MVP_OPEN) {
          const casesRes = await fetch("/api/cases");
          if (casesRes.ok) {
            const json = (await casesRes.json()) as { cases?: CaseRecord[] };
            setCases(json.cases ?? []);
          }
          setProfile(null);
          setClinical(null);
          setLatestScales([]);
          return;
        }

        const [profileData, casesRes] = await Promise.all([
          getProfileClient(),
          fetch("/api/cases"),
        ]);
        setProfile(profileData);
        if (casesRes.ok) {
          const json = (await casesRes.json()) as { cases?: CaseRecord[] };
          setCases(json.cases ?? []);
        }
        if (casesRes.ok) {
          try {
            const clinicalRes = await fetch("/api/summary/clinical");
            if (clinicalRes.ok) {
              const cJson = (await clinicalRes.json()) as {
                clinicalSummary?: ClinicalSummary;
              };
              if (cJson.clinicalSummary) setClinical(cJson.clinicalSummary);
            }
            const trendRes = await fetch("/api/scales/trend", { cache: "no-store" });
            if (trendRes.ok) {
              const tJson = await trendRes.json();
              const mmseLatest = tJson?.mmse?.latest
                ? [
                    {
                      id: 0,
                      scale_type: "MMSE",
                      scale_date: tJson.mmse.latest.date,
                      total_score: tJson.mmse.latest.score,
                      payload_json: null,
                      source: "manual",
                      note: null,
                      created_at: "",
                      updated_at: "",
                    } as ClinicalScaleRecord,
                  ]
                : [];
              const cdrLatest = tJson?.cdr?.latest
                ? [
                    {
                      id: 1,
                      scale_type: "CDR",
                      scale_date: tJson.cdr.latest.date,
                      total_score: tJson.cdr.latest.global,
                      payload_json: null,
                      source: "manual",
                      note: null,
                      created_at: "",
                      updated_at: "",
                    } as ClinicalScaleRecord,
                  ]
                : [];
              setLatestScales([...mmseLatest, ...cdrLatest]);
            }
          } catch (err) {
            console.warn("clinical summary fetch failed", err);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const recentEvents = useMemo(() => {
    const sorted = [...cases].sort(
      (a, b) =>
        new Date(b.event_datetime || 0).getTime() -
        new Date(a.event_datetime || 0).getTime(),
    );
    return sorted.slice(0, 5);
  }, [cases]);

  const trendData: TrendItem[] = useMemo(() => {
    const cutoff = Date.now() - 30 * DAY_MS;
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
  }, [cases]);

  const trendMax = trendData.reduce((max, item) => Math.max(max, item.count), 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-gray-100">
      <DashboardNav />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pb-24 pt-4 md:pb-12">
        <header className="pt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">個案主頁</h1>
              <p className="text-sm text-gray-400">總覽個案摘要、最新事件與趨勢</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = `${window.location.origin}/share/default`;
                void navigator.clipboard?.writeText(url);
                setMessage("已複製分享連結");
              }}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
            >
              複製分享連結
              <span className="text-xs text-blue-200">/share/default</span>
            </button>
          </div>
        </header>

        {message && !loading && (
          <div className="rounded-md border border-gray-800 bg-gray-900/80 px-3 py-2 text-sm text-gray-100">
            {message}
          </div>
        )}

        {loading && <div className="text-sm text-gray-400">載入中…</div>}

        {/* Case Profile Summary */}
        {profile && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm uppercase tracking-wide text-gray-400">
                  Case Profile Summary
                </div>
                <h2 className="text-2xl font-semibold">{profile.display_name}</h2>
                <div className="mt-1 text-gray-300">
                  {calcAgeFromYear(profile.birth_year) || "年齡：—"}
                </div>
                <div className="text-sm text-gray-300">
                  病程階段：{" "}
                  {profile.stage.manual
                    ? `${profile.stage.manual}（使用者指定）`
                    : `${profile.stage.auto}（系統自動判定）`}
                </div>
              </div>
              <Link
                href="/profile"
                className="inline-flex items-center rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-600/20"
              >
                編輯個案
              </Link>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
                <div className="text-xs text-gray-500">診斷</div>
                <div className="text-gray-100">
                  {profile.diagnosis_type || "—"}{" "}
                  {profile.diagnosis_date ? `（${profile.diagnosis_date}）` : ""}
                </div>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
                <div className="text-xs text-gray-500">醫院 / 醫師</div>
                <div className="text-gray-100">
                  {profile.privacy_mode === "masked"
                    ? "某醫療院所"
                    : profile.hospital_info?.name || "—"}{" "}
                  {profile.hospital_info?.doctor
                    ? `· ${
                        profile.privacy_mode === "masked"
                          ? "某醫師"
                          : profile.hospital_info.doctor
                      }`
                    : ""}
                </div>
              </div>
            </div>
          </section>
        )}

        {clinical && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="mb-2 text-sm uppercase tracking-wide text-gray-400">
              病程摘要（Mini）
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2 text-sm">
                {clinical.topSymptoms.slice(0, 2).map((s) => (
                  <span
                    key={s.symptom}
                    className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white"
                  >
                    {s.symptom} · {s.count}
                  </span>
                ))}
                {clinical.topSymptoms.length === 0 && (
                  <span className="text-xs text-gray-400">尚無症狀統計</span>
                )}
              </div>
              {clinical.recentNotableEvents.length > 0 && (
                <div className="text-sm text-gray-200">
                  最新需留意事件：{" "}
                  {(() => {
                    const ev = clinical.recentNotableEvents[0];
                    const title =
                      typeof ev.title === "object"
                        ? ev.title?.zh ?? ev.title?.en ?? ""
                        : ev.title_zh ?? "";
                    const short =
                      typeof ev.short_sentence === "object"
                        ? ev.short_sentence?.zh ?? ev.short_sentence?.en ?? ""
                        : ev.short_sentence_zh ?? "";
                    return title || short || "未命名事件";
                  })()}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recent Events */}
        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">
                Recent Events
              </div>
              <h2 className="text-xl font-semibold">最新事件</h2>
            </div>
            <Link
              href="/cases"
              className="text-sm text-blue-300 underline-offset-4 hover:underline"
            >
              查看全部
            </Link>
          </div>

          {recentEvents.length === 0 ? (
            <div className="text-sm text-gray-400">尚無事件紀錄。</div>
          ) : (
            <div className="grid gap-3">
              {recentEvents.map((item) => {
                const firstPhoto = Array.isArray(item.photos)
                  ? item.photos.find((p) => (p as { filename?: string }).filename)
                  : undefined;
                const photoSrc =
                  item.id && firstPhoto && (firstPhoto as { filename: string }).filename
                    ? `/photos/${item.id}/${
                        (firstPhoto as { filename: string }).filename
                      }`
                    : null;
                return (
                  <Link
                    href={`/cases/${item.slug}`}
                    key={item.id}
                    className="group flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 transition hover:border-blue-500 hover:bg-neutral-900"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{formatDateTime(item.event_datetime)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-50 group-hover:text-white">
                      {item.title_zh || "未命名事件"}
                    </h3>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {item.short_sentence_zh || item.summary_zh || "—"}
                    </p>
                    {photoSrc && (
                      <div className="overflow-hidden rounded-lg border border-neutral-800">
                        <Image
                          src={photoSrc}
                          alt={item.title_zh || "event photo"}
                          width={800}
                          height={450}
                          className="h-40 w-full object-cover transition duration-200 group-hover:scale-[1.01]"
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {profile && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
            <div className="text-sm uppercase tracking-wide text-gray-400">照護摘要</div>
            <div className="mt-2 space-y-2 text-sm text-gray-200">
              {profile.caregivers.length === 0 && <div>未填寫照護者資料</div>}
              {profile.caregivers.map((c, idx) => (
                <div
                  key={`${c.name}-${idx}`}
                  className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
                >
                  {profile.privacy_mode === "masked" ? maskCaregiverLabel(idx) : c.name}（
                  {c.relation || "未填"}）
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Trend Overview */}
        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">
                Trend Overview (30 days)
              </div>
              <h2 className="text-xl font-semibold">症狀趨勢</h2>
            </div>
            <Link
              href="/summary"
              className="text-sm text-blue-300 underline-offset-4 hover:underline"
            >
              查看統計
            </Link>
          </div>

          {trendData.length === 0 ? (
            <div className="text-sm text-gray-400">最近 30 天沒有事件紀錄。</div>
          ) : (
            <div className="space-y-2">
              {trendData.map((item) => {
                const barWidth = trendMax ? Math.max((item.count / trendMax) * 100, 5) : 0;
                return (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-200">
                      <span>{item.label}</span>
                      <span className="text-gray-400">{item.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">
                Visit Brief
              </div>
              <h2 className="text-xl font-semibold">回診摘要</h2>
              <p className="text-sm text-gray-400">量表與近期事件概覽</p>
            </div>
            <Link
              href="/visit-brief"
              className="rounded-full border border-blue-500 px-3 py-1.5 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
            >
              查看
            </Link>
          </div>
          <div className="space-y-2 text-sm text-neutral-200">
            {latestScales.length === 0 && <div>近期沒有量表資料。</div>}
            {latestScales.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
              >
                <span>
                  {s.scale_type} · {s.scale_date}
                </span>
                <span className="font-semibold text-blue-300">
                  {s.total_score ?? "—"}
                </span>
              </div>
            ))}
            {clinical && clinical.recentNotableEvents.length > 0 && (
              <div className="mt-2">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Notable Events
                </div>
                <ul className="mt-1 space-y-1 text-sm">
                  {clinical.recentNotableEvents.slice(0, 3).map((ev) => {
                    const title =
                      typeof ev.title === "object"
                        ? ev.title?.zh ?? ev.title?.en ?? ""
                        : ev.title_zh ?? "";
                    return (
                      <li key={ev.slug || ev.event_datetime} className="text-neutral-200">
                        • {title || ev.short_sentence_zh || "未命名事件"}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-400">Scales Trend</div>
              <h2 className="text-xl font-semibold">量表趨勢</h2>
              <p className="text-sm text-gray-400">點擊查看最近一年的變化趨勢</p>
            </div>
            <Link
              href="/scales/trend"
              className="rounded-full border border-emerald-500 px-3 py-1.5 text-sm font-semibold text-emerald-100 hover:bg-emerald-600/20"
            >
              查看
            </Link>
          </div>
          <div className="space-y-2 text-sm text-neutral-200">
            <div>
              最近 MMSE：
              {latestScales.find((s) => s.scale_type === "MMSE")?.total_score ?? "—"}
            </div>
            <div>
              最近 CDR：
              {latestScales.find((s) => s.scale_type === "CDR")?.total_score ?? "—"}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
