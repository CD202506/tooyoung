type ShareResponse = {
  privacy: "limited" | "public";
  profile: { display_name: string };
  events: Array<Record<string, unknown>>;
  metrics?: Record<string, unknown>;
};

async function fetchShare(token: string): Promise<{ status: number; data?: ShareResponse }> {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/share/${token}`, { cache: "no-store" });
    if (!res.ok) {
      return { status: res.status };
    }
    const json = (await res.json()) as ShareResponse;
    return { status: res.status, data: json };
  } catch {
    return { status: 500 };
  }
}

export default async function SharePage({ params }: { params: { token: string } }) {
  const { token } = params;
  const result = await fetchShare(token);

  if (result.status === 403) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-50">
        <h1 className="text-xl font-semibold">此個案未開放分享</h1>
        <p className="mt-2 text-sm text-neutral-300">隱私設定為私有，無法查看內容。</p>
      </main>
    );
  }

  if (result.status === 404) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-50">
        <h1 className="text-xl font-semibold">分享連結不存在</h1>
        <p className="mt-2 text-sm text-neutral-300">請確認連結是否正確或已被撤銷。</p>
      </main>
    );
  }

  if (!result.data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-50">
        <h1 className="text-xl font-semibold">無法載入分享內容</h1>
        <p className="mt-2 text-sm text-neutral-300">請稍後再試。</p>
      </main>
    );
  }

  const { data } = result;

  if (data.privacy === "limited") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-50">
        <h1 className="text-xl font-semibold">僅顯示部分資訊</h1>
        <p className="mt-2 text-sm text-neutral-300">個案：{data.profile.display_name}</p>
        <section className="mt-4 space-y-2">
          {data.events.length === 0 ? (
            <div className="text-sm text-neutral-300">最近 30 日無事件。</div>
          ) : (
            data.events.map((ev, idx) => (
              <div key={idx} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
                <div className="text-xs text-neutral-400">{ev.event_datetime as string}</div>
                <div className="text-sm font-semibold text-neutral-100">
                  {(ev.title_zh as string) || "未命名事件"}
                </div>
                <div className="text-sm text-neutral-300">
                  {(ev.short_sentence_zh as string) || "（無摘要）"}
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    );
  }

  // public
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-neutral-50">
      <h1 className="text-xl font-semibold">完整事件</h1>
      <p className="mt-2 text-sm text-neutral-300">個案：{data.profile.display_name}</p>
      <section className="mt-4 space-y-3">
        {data.events.length === 0 ? (
          <div className="text-sm text-neutral-300">目前沒有事件。</div>
        ) : (
          data.events.map((ev, idx) => (
            <div key={idx} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-3">
              <div className="text-xs text-neutral-400">{ev.event_datetime as string}</div>
              <div className="text-sm font-semibold text-neutral-100">
                {(ev.title_zh as string) || "未命名事件"}
              </div>
              <div className="text-sm text-neutral-300">
                {(ev.summary_zh as string) || "（無摘要）"}
              </div>
              {Array.isArray(ev.symptom_categories) && ev.symptom_categories.length > 0 && (
                <div className="mt-1 text-xs text-neutral-400">
                  症狀：{(ev.symptom_categories as string[]).join(", ")}
                </div>
              )}
              {Array.isArray(ev.tags) && ev.tags.length > 0 && (
                <div className="mt-1 text-xs text-neutral-400">
                  標籤：{(ev.tags as string[]).join(", ")}
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}
