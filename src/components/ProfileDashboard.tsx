import Link from "next/link";
import { ClipboardDocumentListIcon, ChartBarIcon, ClockIcon } from "@heroicons/react/24/outline";

export type DashboardProfile = {
  display_name?: string | null;
  nickname?: string | null;
};

export type DashboardEvent = {
  slug?: string;
  title?: string;
  summary?: string | null;
  event_datetime?: string | null;
  symptom_categories?: string[];
};

type Card = {
  title: string;
  description: string;
  href: string;
  icon: JSX.Element;
};

function formatDate(date?: string | null) {
  if (!date) return "尚無紀錄";
  const dt = new Date(date);
  if (Number.isNaN(dt.getTime())) return date;
  return dt.toISOString().slice(0, 10);
}

export function ProfileDashboard({ profile, events }: { profile: DashboardProfile; events: DashboardEvent[] }) {
  const name = profile.display_name || profile.nickname || "個案 1";
  const total = events.length;
  const latest = events
    .map((ev) => ev.event_datetime)
    .filter(Boolean)
    .sort((a, b) => (a && b ? (a > b ? -1 : 1) : 0))[0];

  const cards: Card[] = [
    {
      title: "事件記錄",
      description: "查看所有紀錄的事件，依時間排序。",
      href: "/cases",
      icon: <ClipboardDocumentListIcon className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "症狀統計",
      description: "統計各項症狀出現頻率，從資料找趨勢。",
      href: "/symptoms",
      icon: <ChartBarIcon className="h-5 w-5 text-neutral-500" />,
    },
    {
      title: "病程時間軸",
      description: "沿著時間軸查看病程演變與重要事件。",
      href: "/timeline",
      icon: <ClockIcon className="h-5 w-5 text-neutral-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-neutral-500">個案資訊</div>
            <h1 className="text-xl font-semibold text-neutral-900 md:text-2xl">{name}</h1>
            <p className="text-sm text-neutral-600">事件總數：{total}</p>
          </div>
          <div className="text-xs text-neutral-500 md:text-sm">
            最近一次紀錄：<span className="font-semibold text-neutral-800">{formatDate(latest)}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              {card.icon}
              <h2 className="text-base font-semibold text-neutral-900">{card.title}</h2>
            </div>
            <p className="text-sm text-neutral-600">{card.description}</p>
            <div>
              <Link
                href={card.href}
                className="inline-flex items-center rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
              >
                查看
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
