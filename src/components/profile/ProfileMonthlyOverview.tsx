import React from "react";

export function ProfileMonthlyOverview() {
  return (
    <section className="space-y-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm md:p-6">
      <div>
        <h2 className="text-base font-semibold tracking-wide text-neutral-800 md:text-lg">這段時間的小發現 / 心情</h2>
        <p className="text-xs text-neutral-500 md:text-sm">以後會放上更多自動化觀察，現為佔位。</p>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        {[
          { title: "⚠️ 行為提醒", desc: "有時會突然起身，記得家中安全動線保持通暢。", status: "in progress" },
          { title: "📌 照護小發現", desc: "傍晚時分心情較不安，提早準備舒緩活動（音樂/散步）。", status: "in progress" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-2 rounded-xl border border-dashed border-neutral-200 bg-white/70 p-3 shadow-sm md:p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                <span>{item.title}</span>
              </div>
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                {item.status}
              </span>
            </div>
            <p className="text-xs text-neutral-700 md:text-sm md:leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
