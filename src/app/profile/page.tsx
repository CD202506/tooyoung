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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile");
        const json = await res.json();
        if (json?.ok && json.profile) {
          setProfile(json.profile as CaseProfile);
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
          <ProfileForm profile={profile} loading={saving} onSubmit={handleSubmit} />
        )}
      </div>
    </main>
  );
}
