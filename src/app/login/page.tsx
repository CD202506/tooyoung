"use client";

import { useState } from "react";

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ password: pw }),
    });
    const json = (await res.json()) as { ok: boolean };
    if (json.ok) {
      window.location.href = "/dashboard";
    } else {
      setError("密碼錯誤，請再試一次");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <form
        onSubmit={login}
        className="flex w-full max-w-xs flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6"
      >
        <h1 className="text-center text-xl font-bold">登入 Tooyoung</h1>
        <input
          type="password"
          className="rounded bg-neutral-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="請輸入密碼"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-700">
          登入
        </button>
      </form>
    </main>
  );
}
