"use client";

import { useEffect, useMemo, useState } from "react";
import { CaseProfile } from "@/types/profile";
import { CaregiverList } from "@/components/profile/CaregiverList";
import { normalizeProfile } from "@/lib/normalizeProfile";

type Props = {
  profile: CaseProfile;
  loading?: boolean;
  onSubmit: (updated: CaseProfile) => Promise<void> | void;
};

type StageValue = "early" | "middle" | "late" | "none";

export function ProfileForm({ profile, loading = false, onSubmit }: Props) {
  const [form, setForm] = useState<CaseProfile>(profile);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const manualStage: StageValue = useMemo(() => {
    if (form.stage.manual === null) return "none";
    return form.stage.manual;
  }, [form.stage.manual]);

  const handleChange = <K extends keyof CaseProfile>(key: K, value: CaseProfile[K]) => {
    setForm({ ...form, [key]: value });
  };

  const handleStageChange = (value: StageValue) => {
    setForm({
      ...form,
      stage: {
        ...form.stage,
        manual: value === "none" ? null : value,
      },
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!form.display_name.trim()) {
      setError("顯示名稱為必填");
      return;
    }

    setSubmitting(true);
    try {
      const normalized = normalizeProfile(form);
      await onSubmit(normalized);
      setSuccess("Profile 已更新");
    } catch (err) {
      console.error(err);
      setError("儲存時發生錯誤");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(profile);
    setError("");
    setSuccess("");
  };

  const disabled = loading || submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {(error || success) && (
        <div
          className={`rounded-md border px-3 py-2 text-sm ${
            error
              ? "border-red-500/50 bg-red-500/10 text-red-100"
              : "border-green-500/50 bg-green-500/10 text-green-100"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          <h2 className="text-lg font-semibold text-neutral-50">基本資料</h2>
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>顯示名稱（必填）</span>
              <input
                value={form.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>法定姓名</span>
              <input
                value={form.legal_name ?? ""}
                onChange={(e) => handleChange("legal_name", e.target.value || null)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>出生年份</span>
              <input
                type="number"
                inputMode="numeric"
                value={form.birth_year ?? ""}
                onChange={(e) =>
                  handleChange(
                    "birth_year",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>性別</span>
              <select
                value={form.gender ?? ""}
                onChange={(e) =>
                  handleChange("gender", (e.target.value || null) as CaseProfile["gender"])
                }
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="">未填</option>
                <option value="M">男性</option>
                <option value="F">女性</option>
                <option value="Other">其他</option>
              </select>
            </label>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          <h2 className="text-lg font-semibold text-neutral-50">診斷資訊</h2>
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>診斷日期</span>
              <input
                type="date"
                value={form.diagnosis_date ?? ""}
                onChange={(e) => handleChange("diagnosis_date", e.target.value || null)}
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-neutral-200">
              <span>診斷類型</span>
              <select
                value={form.diagnosis_type ?? "YOAD"}
                onChange={(e) =>
                  handleChange(
                    "diagnosis_type",
                    (e.target.value || "YOAD") as CaseProfile["diagnosis_type"],
                  )
                }
                className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
              >
                <option value="YOAD">YOAD</option>
                <option value="EOAD">EOAD</option>
                <option value="FTD">FTD</option>
                <option value="Vascular">Vascular</option>
                <option value="Other">Other</option>
              </select>
            </label>
          </div>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          <h2 className="text-lg font-semibold text-neutral-50">病程階段</h2>
          <div className="text-sm text-neutral-300">
            系統判定（auto）：{form.stage.auto}
          </div>
          <div className="space-y-2 text-sm text-neutral-200">
            <div className="text-neutral-400">手動覆寫（如未設定請選「none」）</div>
            <div className="flex flex-wrap gap-3">
              {["none", "early", "middle", "late"].map((v) => (
                <label key={v} className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="stage_manual"
                    value={v}
                    checked={manualStage === v}
                    onChange={() => handleStageChange(v as StageValue)}
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{v}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
          <h2 className="text-lg font-semibold text-neutral-50">隱私模式</h2>
          <div className="space-y-2 text-sm text-neutral-200">
            {[
              { label: "public（完全公開）", value: "public" },
              { label: "masked（暱稱＋遮蔽）", value: "masked" },
              { label: "private（不可分享）", value: "private" },
            ].map((item) => (
              <label key={item.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="privacy_mode"
                  value={item.value}
                  checked={form.privacy_mode === item.value}
                  onChange={(e) =>
                    handleChange(
                      "privacy_mode",
                      e.target.value as CaseProfile["privacy_mode"],
                    )
                  }
                  className="h-4 w-4"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
        <h2 className="text-lg font-semibold text-neutral-50">照護成員</h2>
        <CaregiverList
          value={form.caregivers ?? []}
          onChange={(next) => handleChange("caregivers", next)}
        />
      </section>

      <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
        <h2 className="text-lg font-semibold text-neutral-50">醫療機構資訊</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-neutral-200">
            <span>醫院</span>
            <input
              value={form.hospital_info.name ?? ""}
              onChange={(e) =>
                handleChange("hospital_info", {
                  ...form.hospital_info,
                  name: e.target.value || null,
                })
              }
              className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-neutral-200">
            <span>科別</span>
            <input
              value={form.hospital_info.dept ?? ""}
              onChange={(e) =>
                handleChange("hospital_info", {
                  ...form.hospital_info,
                  dept: e.target.value || null,
                })
              }
              className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-neutral-200">
            <span>醫師</span>
            <input
              value={form.hospital_info.doctor ?? ""}
              onChange={(e) =>
                handleChange("hospital_info", {
                  ...form.hospital_info,
                  doctor: e.target.value || null,
                })
              }
              className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
            />
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/70 p-4">
        <h2 className="text-lg font-semibold text-neutral-50">備註</h2>
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => handleChange("notes", e.target.value)}
          rows={4}
          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 focus:border-blue-500 focus:outline-none"
          placeholder="其他補充說明…"
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {submitting ? "儲存中…" : "Save"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={disabled}
          className="rounded-md border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 hover:bg-neutral-800 disabled:opacity-60"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
