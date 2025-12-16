"use client";

import { useState } from "react";

export default function LoginPage() {
  const [account, setAccount] = useState("");
  const [pw, setPw] = useState("");
  const SUCCESS_REDIRECT = "/dashboard";

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO(Auth later): replace with real auth / API. V1 demo only.
    if (account === "0000" && pw === "0000") {
      window.location.href = SUCCESS_REDIRECT;
      return;
    }
    // 仍直接導向，保持無驗證的 V1 流程
    window.location.href = SUCCESS_REDIRECT;
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
      <form
        onSubmit={login}
        className="flex w-full max-w-xs flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900 p-6"
      >
        <h1 className="text-center text-xl font-bold">登入 Tooyoung</h1>
        <input
          type="text"
          className="rounded bg-neutral-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="帳號 (請輸入 0000)"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
        />
        <input
          type="password"
          className="rounded bg-neutral-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
          placeholder="密碼 (請輸入 0000)"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-700">
          登入
        </button>
        <p className="text-center text-xs text-neutral-400">
          還沒有帳號？<a className="underline" href="/register">前往註冊</a>
        </p>
      </form>
    </main>
  );
}
