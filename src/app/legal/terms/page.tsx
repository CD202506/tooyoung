import { NavBar } from "@/components/marketing/NavBar";
import { Footer } from "@/components/marketing/Footer";

export default function TermsPage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-neutral-950 text-gray-100">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
          <header className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-gray-400">
              Terms of Use · 使用條款
            </div>
            <h1 className="text-3xl font-semibold">使用條款</h1>
            <p className="text-sm text-gray-400">
              使用前請確認以下條款，若有疑慮請停止使用並洽詢醫療專業。
            </p>
          </header>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-white">繁體中文</h2>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• 禁止將本服務用於非法用途、攻擊他人或上傳不當內容。</li>
              <li>• 本服務不取代專業醫療建議，如有疑慮請洽專業醫師。</li>
              <li>• 條款可能隨時更新，使用者需留意最新版本。</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-sm space-y-3">
            <h2 className="text-xl font-semibold text-white">English</h2>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>• Do not use this service for illegal purposes or harmful content.</li>
              <li>• This service does not replace professional medical advice; consult physicians when needed.</li>
              <li>• Terms may change; please review updates regularly.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
