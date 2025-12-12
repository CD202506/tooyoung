import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

export default function PrivacyPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Privacy Policy · 隱私權政策
            </div>
            <h1 className="text-3xl font-semibold">隱私權政策</h1>
            <p className="text-sm text-gray-400">
              本服務主要給照護者自用，不會主動公開到公共平台。
            </p>
          </header>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-white">繁體中文</h2>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• 個案資料僅供個人帳號使用，不用於廣告或追蹤。</li>
              <li>• 不會主動上傳公共平台；分享時請自行確認隱私模式。</li>
              <li>• 我們會盡力保護資料安全，但請妥善保管裝置與登入資訊。</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-white">English</h2>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• Data is for your account only; we do not use it for ads or tracking.</li>
              <li>• Nothing is uploaded publicly by default; please review sharing modes.</li>
              <li>• We strive to protect your data, but keep your device and login secure.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
