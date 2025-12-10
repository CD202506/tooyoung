"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { CaseProfile } from "@/types/profile";
import { normalizeProfile } from "@/lib/normalizeProfile";

export default function ProfilePage() {
  const [profile, setProfile] = useState<CaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [shareMode, setShareMode] = useState<"private" | "protected" | "public">("private");
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string>("");
  const [shareLoading, setShareLoading] = useState(false);
  const [latestSlug, setLatestSlug] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json?.ok && json.profile) {
          setProfile(json.profile as CaseProfile);
          setShareMode((json.profile.share_mode as typeof shareMode) ?? "private");
          setShareToken((json.profile.share_token as string | null) ?? null);
        } else {
          throw new Error(json?.error || "load failed");
        }
      } catch (err) {
        console.error(err);
        setMessage("載入失敗");
      } finally {
        setLoading(false);
      }
    };
    load();

    const loadLatestSlug = async () => {
      try {
        const res = await fetch("/api/latest", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const slug = json?.cases?.[0]?.slug as string | undefined;
        if (slug) setLatestSlug(slug);
      } catch (err) {
        console.warn("load latest slug failed", err);
      }
    };
    loadLatestSlug();
  }, []);

  const handleSubmit = async (updated: CaseProfile) => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "更新失敗");
      }
      const normalized = normalizeProfile(json.profile as Partial<CaseProfile>);
      setProfile(normalized);
      setMessage("Profile 已更新");
    } catch (err) {
      console.error(err);
      setMessage("儲存時發生錯誤");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleShareUpdate = async (
    mode: "private" | "protected" | "public",
    regenerate = false,
  ) => {
    setShareLoading(true);
    setShareMessage("");
    try {
      const res = await fetch("/api/profile/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ share_mode: mode, regenerate_token: regenerate }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.error || "update failed");
      }
      setShareMode(mode);
      setShareToken(mode === "protected" ? (json.share_token as string | null) ?? null : null);
      setShareMessage("分享設定已更新");
    } catch (err) {
      console.error(err);
      setShareMessage("更新分享設定失敗");
    } finally {
      setShareLoading(false);
    }
  };

  const shareLink = (() => {
    const base =
      (typeof window !== "undefined" && window.location?.origin) ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      "http://localhost:3000";
    const slug = latestSlug || "{slug}";
    if (shareMode === "protected") {
      const token = shareToken || "{token}";
      return `${base}/share/${slug}?token=${token}`;
    }
    if (shareMode === "public") {
      return `${base}/share/${slug}`;
    }
    return null;
  })();

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-6 text-neutral-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">個案設定</h1>
          <p className="text-sm text-neutral-400">管理個案主檔，回診前快速更新資訊</p>
          {message && (
            <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100">
              {message}
            </div>
          )}
        </header>

        {loading && <div className="text-sm text-neutral-400">載入中…</div>}
        {!loading && profile && (
          <>
            <ProfileForm profile={profile} loading={saving} onSubmit={handleSubmit} />

            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-neutral-50">分享設定</h2>
                  <p className="text-sm text-neutral-400">
                    控制此個案的事件是否可以透過連結分享。
                  </p>
                </div>
                {shareMessage && (
                  <div className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs text-neutral-100">
                    {shareMessage}
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm text-neutral-200">
                {[
                  { label: "私密（不分享）", value: "private" as const },
                  { label: "受保護連結（需要安全連結）", value: "protected" as const },
                  { label: "公開閱讀（任何人都可查看）", value: "public" as const },
                ].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="share_mode"
                      value={opt.value}
                      checked={shareMode === opt.value}
                      onChange={() => handleShareUpdate(opt.value)}
                      disabled={shareLoading}
                      className="h-4 w-4"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              {shareMode === "private" && (
                <div className="text-sm text-neutral-400">此個案不開放對外分享。</div>
              )}

              {shareMode === "protected" && (
                <div className="space-y-3">
                  <div className="text-sm text-neutral-300">受保護分享連結：</div>
                  <div className="rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-100">
                    {shareLink || "尚未產生分享連結"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (shareLink) {
                          void navigator.clipboard.writeText(shareLink);
                          setShareMessage("已複製分享連結");
                        }
                      }}
                      disabled={!shareLink || shareLoading}
                      className="rounded-md bg-gray-800 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
                    >
                      複製連結
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareUpdate("protected", true)}
                      disabled={shareLoading}
                      className="rounded-md bg-gray-700 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-600 disabled:opacity-60"
                    >
                      重新產生安全連結
                    </button>
                  </div>
                </div>
              )}

              {shareMode === "public" && (
                <div className="space-y-2 text-sm text-neutral-300">
                  <div>
                    所有公開案例頁面可透過 /share/
                    {latestSlug || "{slug}"} 存取（不需 token）。
                  </div>
                  {shareLink && (
                    <div className="rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-xs text-neutral-100">
                      {shareLink}
                    </div>
                  )}
                  <div className="text-xs text-amber-200">
                    請再次確認內容沒有包含真實姓名或醫院名稱。
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
