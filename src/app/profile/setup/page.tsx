"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileSetupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");

  const canSubmit = displayName.trim() !== "" && role !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    // TODO: 這裡之後可改為真正 API / Supabase
    // V0：先用 localStorage / mock 當作完成設定
    const profile = {
      display_name: displayName,
      role,
      profile_completed: true,
    };

    localStorage.setItem("tooyoung_profile", JSON.stringify(profile));

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow"
      >
        <header className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">在開始之前</h1>
          <p className="text-neutral-300 text-sm leading-relaxed">
            這些資訊只用來幫助系統理解你的位置，
            <br />
            不會公開顯示，也不是醫療紀錄。
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-neutral-300">顯示名稱</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="例如：小明、媽媽、照顧者A"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-neutral-300">你的身分</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">請選擇</option>
              <option value="caregiver">家庭照護者</option>
              <option value="patient">當事人</option>
              <option value="observer">關注這個議題的人</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-blue-600 py-2 font-medium disabled:opacity-40 hover:bg-blue-500 transition"
        >
          我，可以了！
        </button>
      </form>
    </main>
  );
}
