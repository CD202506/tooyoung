import { notFound } from "next/navigation";
import { CaseRecord } from "@/types/case";
import { normalizeCase } from "@/lib/normalizeCase";
import { normalizeForDisplay } from "@/lib/normalizeForDisplay";
import { symptomCategories } from "@/lib/symptomCategories";
import { PhotoGallery } from "@/components/PhotoGallery";
import { SharePreviewPanel } from "@/components/SharePreviewPanel";
import { CaseDetailActions } from "@/components/CaseDetailActions";
import { getProfileClient } from "@/lib/getProfileClient";
import { maskSensitiveText, maskHospital } from "@/lib/privacyMask";
import { normalizeProfile } from "@/lib/normalizeProfile";

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

async function getCase(slug: string): Promise<CaseRecord | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/cases/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  const asObj = data as { case?: CaseRecord };
  return normalizeCase(asObj.case ?? (data as CaseRecord));
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug) return notFound();

  const itemRaw = await getCase(slug);
  if (!itemRaw) return notFound();

  const profile = normalizeProfile(await getProfileClient());

  const item = normalizeForDisplay(itemRaw);
  const eventDateTime =
    item.event_datetime ||
    (item.event_date && item.event_time
      ? `${item.event_date} ${item.event_time}`
      : item.event_date) ||
    "";

  const symptomLabels = Array.isArray(item.symptom_categories)
    ? item.symptom_categories
        .map((id) => symptomCategories.find((c) => c.id === id)?.labelZh)
        .filter(Boolean)
    : [];

  const masked = profile.privacy_mode === "masked";
  const displayShort = masked ? maskSensitiveText(item.displayShort) : item.displayShort;
  const displayFull = masked ? maskSensitiveText(item.displayFull) : item.displayFull;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-neutral-100">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">{formatDateTime(eventDateTime)}</div>
            <h1 className="text-3xl font-semibold leading-tight text-white">
              {item.title_zh || "未命名事件"}
            </h1>
            <div className="text-sm text-blue-300">個案：{profile.display_name}</div>
            {symptomLabels.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {symptomLabels.map((label, idx) => (
                  <span
                    key={`${label}-${idx}`}
                    className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white"
                  >
                    {label}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">未分類</div>
            )}
          </div>
          <div className="flex justify-end">
            <CaseDetailActions slug={slug} />
          </div>
        </div>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
          <div className="text-sm font-semibold text-neutral-100">個案資訊摘要</div>
          <div className="mt-2 grid gap-2 text-sm text-neutral-200">
            <div>顯示名稱：{profile.display_name}</div>
            <div>
              病程階段：{" "}
              {profile.stage.manual
                ? `${profile.stage.manual}（使用者指定）`
                : `${profile.stage.auto}（系統自動判定）`}
            </div>
            <div>診斷日期：{profile.diagnosis_date || "未填"}</div>
            <div>
              病程時間：{profile.diagnosis_date ? profile.diagnosis_date : "未填"}
            </div>
            <div>
              隱私模式：
              {profile.privacy_mode === "public"
                ? "公開"
                : profile.privacy_mode === "masked"
                ? "遮蔽"
                : "私密"}
            </div>
            <div>
              醫療機構：
              {profile.privacy_mode === "masked"
                ? maskHospital(profile.hospital_info?.name)
                : profile.hospital_info?.name || "未提供"}
            </div>
          </div>
        </section>

        {item.displayShort && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="text-sm uppercase tracking-wide text-gray-400">
              主訴 (Chief Complaint)
            </div>
            <p className="mt-2 text-base text-gray-100">{displayShort}</p>
          </section>
        )}

        {item.displayFull && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="text-sm uppercase tracking-wide text-gray-400">
              事件描述 (Narrative Note)
            </div>
            <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-gray-100">
              {displayFull}
            </p>
          </section>
        )}

        {item.galleryPhotos.length > 0 && (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
            <div className="text-sm uppercase tracking-wide text-gray-400">圖片</div>
            <div className="mt-3">
              <PhotoGallery
                photos={item.galleryPhotos}
                photoBase={item.photoBase}
                title={item.title_zh || "事件圖片"}
              />
            </div>
          </section>
        )}

        <section className="mt-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5">
          <h2 className="text-xl font-semibold text-neutral-100">分享預覽</h2>
          <p className="mb-4 mt-1 text-sm text-neutral-400">
            這裡是幫助你整理成可分享文字的範本，不會自動上傳，只會留在你的瀏覽器。
          </p>
          <SharePreviewPanel caseItem={item} />
        </section>
      </div>
    </main>
  );
}
