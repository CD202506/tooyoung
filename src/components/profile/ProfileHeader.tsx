import React from "react";

type ShareMode = "private" | "protected" | "public" | "token";

type Props = {
  nickname: string;
  displayName?: string;
  totalEvents: number;
  shareMode: ShareMode;
  privacyLevel?: "private" | "care_team" | "shared" | "public";
};

const shareModeLabel: Record<ShareMode, string> = {
  private: "🔒 私密",
  protected: "🔗 受保護連結",
  token: "🔗 受保護連結",
  public: "🌍 公開閱讀",
};

const privacyBadge: Record<
  NonNullable<Props["privacyLevel"]>,
  { label: string; className: string }
> = {
  private: {
    label: "🔒 僅自己可見",
    className: "bg-neutral-900 text-white",
  },
  care_team: {
    label: "👥 照護成員可見",
    className: "bg-indigo-600/90 text-white",
  },
  shared: {
    label: "👥 照護成員可見",
    className: "bg-indigo-600/90 text-white",
  },
  public: {
    label: "🌐 可分享連結",
    className: "bg-emerald-600/90 text-white",
  },
};

export function ProfileHeader({
  nickname,
  displayName,
  totalEvents,
  shareMode,
  privacyLevel = "private",
}: Props) {
  const chips = [
    `已記錄 ${totalEvents} 則事件`,
    shareModeLabel[shareMode] ?? shareMode,
  ];

  return (
    <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-gradient-to-r from-amber-50 via-white to-blue-50 p-4 shadow-sm md:mb-8 md:flex-row md:items-center md:justify-between md:p-6">
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-[0.12em] text-neutral-500">Profile</div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-wide text-neutral-900 md:text-2xl">
            {nickname}
            {displayName ? `（${displayName}）` : ""}
          </h1>
          <p className="text-sm text-neutral-500">年輕，不代表它不會發生。</p>
          <p className="text-sm text-neutral-700 leading-relaxed md:text-base md:leading-relaxed">
            這裡是照護日誌，用片段記錄病程的每一步。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-neutral-50 px-3 py-1 text-[11px] font-semibold text-neutral-700 ring-1 ring-neutral-200"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-row items-start gap-3 md:flex-col md:items-end">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
            privacyBadge[privacyLevel]?.className ?? "bg-neutral-900 text-white"
          }`}
        >
          {(privacyBadge[privacyLevel]?.label ?? "🔒 僅自己可見")}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500">
            Last updated：{new Date().toLocaleDateString("zh-TW")}
          </span>
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            編輯個案
          </button>
          <button
            type="button"
            className="rounded-full border border-neutral-900 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-800"
          >
            分享
          </button>
        </div>
      </div>
    </section>
  );
}
