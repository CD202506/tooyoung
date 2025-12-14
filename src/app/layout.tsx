import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/AppHeader";
import { MobileTabBar } from "@/components/MobileTabBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tooyoung — Memory & Care Assistant",
  description: "一個為家庭照護者打造的年輕型失智照護工具與知識平台。",
  openGraph: {
    title: "Tooyoung — Memory & Care Assistant",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="bg-neutral-900/80 text-neutral-100 text-sm border-b border-neutral-800 px-4 py-2 text-center">
          示範模式：目前顯示為範例資料，用於功能展示與流程說明
        </div>
        <AppHeader />
        <main className="pb-[calc(4rem+env(safe-area-inset-bottom))] pt-4 md:pb-0">
          {children}
        </main>
        <MobileTabBar />
      </body>
    </html>
  );
}
