import ShareSettingsPanel from "@/components/ShareSettingsPanel";

type CaseProfileResponse = {
  id: number;
  display_name: string;
  privacy_level: "private" | "limited" | "public";
  share_token: string | null;
  birth_year: number | null;
  gender: "male" | "female" | "other" | null;
};

async function fetchProfile(): Promise<CaseProfileResponse | null> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/case-profile`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as CaseProfileResponse;
  } catch {
    return null;
  }
}

export default async function ShareSettingsPage() {
  const profile = await fetchProfile();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 font-[Noto_Sans_TC] text-neutral-50">
      <header className="mb-6 space-y-1">
        <p className="text-sm text-neutral-400">Sharing & Privacy Settings</p>
        <h1 className="text-2xl font-bold text-neutral-50 sm:text-3xl">
          分享與隱私設定
        </h1>
        <p className="text-sm text-neutral-400">
          控制誰可以看到你的事件紀錄與摘要。
        </p>
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 shadow-sm sm:p-6">
        {profile ? (
          <ShareSettingsPanel profile={profile} />
        ) : (
          <div className="text-sm text-red-300">無法載入個案資料，請稍後再試。</div>
        )}
      </section>
    </main>
  );
}
