import Link from "next/link";
import { ClinicalScaleRecord } from "@/types/clinicalScale";
import { getProfileClient } from "@/lib/getProfileClient";

async function loadScale(id: string): Promise<ClinicalScaleRecord | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/scales/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.data ?? null) as ClinicalScaleRecord | null;
}

export default async function ScaleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [scale, profile] = await Promise.all([loadScale(id), getProfileClient()]);

  if (!scale) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-6 text-neutral-50">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
          找不到量表資料
        </div>
      </main>
    );
  }

  let payloadPretty = "";
  if (scale.payload_json) {
    try {
      payloadPretty = JSON.stringify(JSON.parse(scale.payload_json), null, 2);
    } catch {
      payloadPretty = scale.payload_json;
    }
  }

  const renderPayload = () => {
    if (!scale.payload_json) return <div className="text-sm text-neutral-300">—</div>;
    try {
      const parsed = JSON.parse(scale.payload_json) as Record<string, number>;
      if (scale.scale_type === "MMSE") {
        const fields: { key: string; label: string }[] = [
          { key: "orientation_time", label: "定向（時間）" },
          { key: "orientation_place", label: "定向（地點）" },
          { key: "registration", label: "登記" },
          { key: "attention_calc", label: "注意/計算" },
          { key: "recall", label: "回憶" },
          { key: "language", label: "語言" },
          { key: "repetition", label: "重複" },
          { key: "three_step", label: "三步指令" },
          { key: "reading", label: "閱讀" },
          { key: "writing", label: "書寫" },
          { key: "drawing", label: "臨摹" },
        ];
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-200"
              >
                <span>{f.label}</span>
                <span className="font-semibold text-blue-300">
                  {parsed[f.key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        );
      }
      if (scale.scale_type === "CDR") {
        const fields: { key: string; label: string }[] = [
          { key: "memory", label: "記憶" },
          { key: "orientation", label: "定向感" },
          { key: "judgment", label: "判斷/問題解決" },
          { key: "community", label: "社區活動" },
          { key: "home_hobbies", label: "家庭與興趣" },
          { key: "personal_care", label: "個人照護" },
        ];
        return (
          <div className="grid gap-2 md:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.key}
                className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950/70 px-3 py-2 text-sm text-neutral-200"
              >
                <span>{f.label}</span>
                <span className="font-semibold text-blue-300">
                  {parsed[f.key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      // fallback
    }
    return (
      <pre className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950/70 p-3 text-xs text-neutral-100">
        {payloadPretty}
      </pre>
    );
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 text-neutral-50">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">量表詳情</h1>
          <p className="text-sm text-neutral-400">個案：{profile.display_name}</p>
        </div>
        <Link
          href={`/scales/${scale.id}/edit`}
          className="rounded-full border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-100 hover:bg-blue-600/20"
        >
          編輯
        </Link>
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
          <span className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-100">
            {scale.scale_type}
          </span>
          <span>日期：{scale.scale_date}</span>
          <span>分數：{scale.total_score ?? "—"}</span>
        </div>
        <div>
          <div className="mb-1 text-sm text-neutral-400">備註</div>
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200">
            {scale.note || "—"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-sm text-neutral-400">Payload</div>
          {renderPayload()}
        </div>
      </div>
    </main>
  );
}
