import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PublicContentCarousel from "@/components/PublicContentCarousel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TooYoung｜公共知識與經驗分享",
  description: "一個為家庭照護者打造的年輕型失智照護工具與知識平台。",
  openGraph: {
    title: "TooYoung｜公共知識與經驗分享",
    description: "陪伴、記錄、理解。全方位的照護者工具。",
    url: "https://tooyoung.site",
    siteName: "Tooyoung",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "zh_TW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-950 text-neutral-50`}
      >
        <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur border-b border-neutral-800">
          <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-wide">
              Tooyoung
            </Link>
            <nav className="flex gap-6 text-sm text-neutral-300">
              <Link href="/about" className="hover:text-white">
                關於我們
              </Link>
              <Link href="/stories" className="hover:text-white">
                案例摘錄
              </Link>
              <Link href="/knowledge" className="hover:text-white">
                醫學新知
              </Link>
            </nav>
          </div>
        </header>

        <PublicContentCarousel />

        <main className="min-h-screen pb-16 pt-6">{children}</main>

        <footer className="border-t border-neutral-800 mt-20">
          <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-neutral-500 text-center">
            © Tooyoung — 公共知識與經驗分享平台（非醫療建議）
          </div>
        </footer>
      </body>
    </html>
  );
}
