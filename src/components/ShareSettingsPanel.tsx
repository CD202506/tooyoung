"use client";

import { useMemo, useState } from "react";

type PrivacyLevel = "private" | "limited" | "public";

type Profile = {
  id: number;
  display_name: string;
  privacy_level: PrivacyLevel;
  share_token: string | null;
  birth_year: number | null;
  gender: "male" | "female" | "other" | null;
};

type Props = {
  profile: Profile;
};

const privacyOptions: { value: PrivacyLevel; label: string; desc: string }[] = [
  { value: "private", label: "完全私密", desc: "僅自己可見，停止分享連結" },
  { value: "limited", label: "摘要分享", desc: "分享者僅能看到摘要資訊" },
  { value: "public", label: "完整分享（不含圖片）", desc: "分享者可查看完整事件文字內容" },
];

export default function ShareSettingsPanel({ profile }: Props) {
  const [privacy, setPrivacy] = useState<PrivacyLevel>(profile.privacy_level);
  const [token, setToken] = useState<string | null>(profile.share_token);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const shareLink = useMemo(() => {
    if (!token) return null;
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}/share/${token}`;
    }
    const base =
      process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";
    return `${base}/share/${token}`;
  }, [token]);

  const handlePrivacyChange = async (next: PrivacyLevel) => {
    if (next === privacy) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/case-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privacy_level: next }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as { token_revoked?: boolean };
      setPrivacy(next);
      if (json.token_revoked) {
        setToken(null);
      }
      setMessage("已更新隱私設定");
    } catch (error) {
      console.error("privacy update failed", error);
      setMessage("更新失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/case-profile/share", { method: "POST" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = (await res.json()) as { share_url: string };
      const tokenFromUrl = json.share_url.split("/").pop() ?? null;
      setToken(tokenFromUrl);
      setMessage("已建立分享連結");
    } catch (error) {
      console.error("create share link failed", error);
      setMessage("建立分享連結失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeLink = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/case-profile/share", { method: "DELETE" });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setToken(null);
      setMessage("已停止分享");
    } catch (error) {
      console.error("revoke share link failed", error);
      setMessage("停止分享失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-neutral-50">
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="mb-3 text-sm text-neutral-400">目前模式</div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-lg font-semibold">
            {privacy === "private"
              ? "完全私密"
              : privacy === "limited"
                ? "摘要分享"
                : "完整分享（不含圖片）"}
          </div>
          <div className="text-xs text-neutral-400">
            {privacy === "private"
              ? "您目前的紀錄完全私密"
              : privacy === "limited"
                ? "分享者僅能看到摘要"
                : "分享者可看到完整事件（不含圖片）"}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="mb-3 text-sm font-semibold text-neutral-200">隱私模式</div>
        <div className="grid gap-3 md:grid-cols-3">
          {privacyOptions.map((opt) => {
            const active = privacy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handlePrivacyChange(opt.value)}
                disabled={loading}
                className={`rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-900/30 text-blue-50"
                    : "border-neutral-800 bg-neutral-900/60 text-neutral-200 hover:border-neutral-700"
                }`}
              >
                <div className="text-sm font-semibold">{opt.label}</div>
                <div className="text-xs text-neutral-400">{opt.desc}</div>
                {opt.value === "private" && active && (
                  <div className="mt-1 text-xs text-amber-300">切換為私密將停止分享</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <div className="mb-3 text-sm font-semibold text-neutral-200">分享連結</div>
        {privacy === "private" ? (
          <div className="text-sm text-neutral-400">目前為私密模式，分享已關閉。</div>
        ) : (
          <div className="space-y-3">
            {!token && (
              <button
                type="button"
                onClick={handleCreateLink}
                disabled={loading}
                className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
              >
                建立分享連結
              </button>
            )}
            {token && (
              <div className="space-y-2">
                <div className="text-xs text-neutral-400">分享 URL</div>
                <div className="break-all rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-100">
                  {shareLink}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (shareLink) {
                        void navigator.clipboard.writeText(shareLink);
                        setMessage("已複製分享連結");
                      }
                    }}
                    disabled={!shareLink || loading}
                    className="rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
                  >
                    複製連結
                  </button>
                  <button
                    type="button"
                    onClick={handleRevokeLink}
                    disabled={loading}
                    className="rounded-md bg-gray-700 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-600 disabled:opacity-60"
                  >
                    停止分享
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {message && (
        <div className="rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-200">
          {message}
        </div>
      )}
    </div>
  );
}
