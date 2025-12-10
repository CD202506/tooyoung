import { symptomCategories } from "@/lib/symptomCategories";

type ShareCase = {
  id?: string;
  slug?: string;
  title?: string;
  event_datetime?: string | null;
  summary?: string | null;
  content?: string | null;
  tags?: string[];
  symptom_categories?: string[];
  images?: string[];
};

type ShareProfile = {
  id: number;
  display_name: string;
  nickname?: string;
};

type ShareResponse = {
  case: ShareCase;
  profile: ShareProfile;
  meta: { share_mode: "private" | "protected" | "public" };
};

async function fetchSharedCase(slug: string, token?: string): Promise<{ status: number; data?: ShareResponse }> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  try {
    const res = await fetch(`${base}/api/share/${slug}${qs}`, { cache: "no-store" });
    if (!res.ok) return { status: res.status };
    const json = (await res.json()) as ShareResponse;
    return { status: res.status, data: json };
  } catch {
    return { status: 500 };
  }
}

function symptomLabel(id: string) {
  return symptomCategories.find((c) => c.id === id)?.labelZh || id;
}

export default async function SharedCasePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token;
  const result = await fetchSharedCase(params.slug, token);

  if (!result.data) {
    const msg =
      result.status === 403
        ? "此案例目前未開放分享，或連結/密鑰無效。"
        : result.status === 404
          ? "分享連結不存在或已失效。"
          : "無法載入分享內容，請稍後再試。";
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 text-neutral-50">
        <h1 className="text-xl font-semibold">分享頁面</h1>
        <p className="mt-2 text-sm text-neutral-300">{msg}</p>
      </main>
    );
  }

  const data = result.data;
  const patientName = data.profile.nickname || data.profile.display_name;
  const caseData = data.case;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 text-neutral-50">
      <header className="mb-6 space-y-1">
        <p className="text-sm text-neutral-400">個案：{patientName}</p>
        <h1 className="text-2xl font-bold text-neutral-50">
          {caseData.title || "未命名事件"}
        </h1>
        <p className="text-sm text-neutral-400">
          {caseData.event_datetime || "未提供日期"} · 分享模式：{data.meta.share_mode}
        </p>
      </header>

      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
        {(caseData.symptom_categories?.length ?? 0) > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {caseData.symptom_categories?.map((cat: string) => (
              <span
                key={cat}
                className="rounded-full bg-neutral-800 px-3 py-1 text-xs font-semibold text-neutral-100"
              >
                {symptomLabel(cat)}
              </span>
            ))}
          </div>
        )}

        {(caseData.tags?.length ?? 0) > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-neutral-300">
            標籤：
            {caseData.tags?.map((t: string) => (
              <span key={t} className="rounded-full bg-neutral-800 px-2 py-1 text-xs text-neutral-100">
                {t}
              </span>
            ))}
          </div>
        )}

        {caseData.summary && (
          <div className="mb-3 text-sm text-neutral-200 leading-relaxed">
            <div className="mb-1 text-xs text-neutral-400">摘要</div>
            {caseData.summary}
          </div>
        )}

        {caseData.content && (
          <div className="space-y-2 text-sm text-neutral-200 leading-relaxed">
            <div className="text-xs text-neutral-400">詳細內容</div>
            <p className="whitespace-pre-line">{caseData.content}</p>
          </div>
        )}
      </section>

      {(caseData.images?.length ?? 0) > 0 && (
        <section className="mb-4 space-y-2 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm">
          <div className="text-sm font-semibold text-neutral-100">圖片</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {caseData.images?.map((img, idx) => (
              <div key={img + idx} className="overflow-hidden rounded-lg border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={caseData.title || "案例圖片"} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950/80 px-4 py-3 text-xs text-neutral-400">
        本頁內容僅供照護經驗分享與教學參考，非醫療診斷或個案識別依據。
      </footer>
    </main>
  );
}
