import type { NextApiRequest, NextApiResponse } from "next";
import type { CaseProfile } from "@/types/profile";
import { normalizeProfile } from "@/lib/normalizeProfile";
import { saveProfile } from "@/utils/profileStore";
import { CaseRecord } from "@/types/case";
import fs from "node:fs";
import path from "node:path";
import { normalizeCase } from "@/lib/normalizeCase";

const ALLOWED_DIAGNOSIS: CaseProfile["diagnosis_type"][] = [
  "YOAD",
  "EOAD",
  "FTD",
  "Vascular",
  "Other",
];

const ALLOWED_PRIVACY: CaseProfile["privacy_mode"][] = ["public", "masked", "private"];

const ALLOWED_STAGE: CaseProfile["stage"]["auto"][] = ["early", "middle", "late"];

const ALLOWED_GENDER: (CaseProfile["gender"] | "")[] = ["M", "F", "Other", ""];

function validateInput(body: Partial<CaseProfile>) {
  if (!body.display_name || typeof body.display_name !== "string" || !body.display_name.trim()) {
    return "Invalid field: display_name";
  }

  if (
    body.privacy_mode !== undefined &&
    !ALLOWED_PRIVACY.includes(body.privacy_mode)
  ) {
    return "Invalid field: privacy_mode";
  }

  if (
    body.diagnosis_type !== undefined &&
    body.diagnosis_type !== null &&
    !ALLOWED_DIAGNOSIS.includes(body.diagnosis_type)
  ) {
    return "Invalid field: diagnosis_type";
  }

  if (
    body.gender !== undefined &&
    body.gender !== null &&
    !ALLOWED_GENDER.includes(body.gender)
  ) {
    return "Invalid field: gender";
  }

  if (body.birth_year !== undefined && body.birth_year !== null) {
    if (typeof body.birth_year !== "number" || Number.isNaN(body.birth_year)) {
      return "Invalid field: birth_year";
    }
  }

  if (body.stage) {
    const auto = body.stage.auto;
    const manual = body.stage.manual;
    if (!ALLOWED_STAGE.includes(auto)) {
      return "Invalid field: stage.auto";
    }
    if (manual !== null && manual !== undefined && !ALLOWED_STAGE.includes(manual)) {
      return "Invalid field: stage.manual";
    }
  }

  if (body.caregivers) {
    if (!Array.isArray(body.caregivers)) {
      return "Invalid field: caregivers";
    }
    for (const c of body.caregivers) {
      if (!c || typeof c.name !== "string" || typeof c.relation !== "string") {
        return "Invalid field: caregivers";
      }
    }
  }

  return null;
}

function sanitizeInput(body: Partial<CaseProfile>): Partial<CaseProfile> {
  const caregivers =
    body.caregivers && Array.isArray(body.caregivers)
      ? body.caregivers
          .map((c) => ({
            name: (c.name ?? "").trim(),
            relation: (c.relation ?? "").trim(),
          }))
          .filter((c) => c.name)
      : [];

  return {
    display_name: body.display_name?.trim() ?? "",
    legal_name: body.legal_name ?? null,
    birth_year: body.birth_year ?? null,
    gender: body.gender ?? null,
    diagnosis_date: body.diagnosis_date ?? null,
    diagnosis_type: body.diagnosis_type ?? "YOAD",
    stage: {
      auto: body.stage?.auto ?? "early",
      manual: body.stage?.manual ?? null,
    },
    privacy_mode: body.privacy_mode ?? "masked",
    caregivers,
    hospital_info: {
      name: body.hospital_info?.name ?? null,
      dept: body.hospital_info?.dept ?? null,
      doctor: body.hospital_info?.doctor ?? null,
    },
    notes: body.notes ?? "",
  };
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = (req.body ?? {}) as Partial<CaseProfile>;
    const error = validateInput(body);
    if (error) {
      return res.status(400).json({ ok: false, error });
    }

    const sanitized = sanitizeInput(body);
    const cases = loadCases();
    const normalized = normalizeProfile(sanitized, cases);
    const saved = saveProfile(normalized as Partial<CaseProfile>, cases);

    return res.status(200).json({ ok: true, profile: saved });
  } catch (err) {
    console.error("profile update error", err);
    return res.status(500).json({ ok: false, error: "Internal error" });
  }
}

function loadCases(): CaseRecord[] {
  const dir = path.join(process.cwd(), "data", "cases");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
  const list: CaseRecord[] = [];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(dir, file), "utf-8");
      const json = JSON.parse(raw) as CaseRecord;
      list.push(normalizeCase(json));
    } catch (err) {
      console.warn("failed to load case file", file, err);
    }
  }
  return list;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST" || req.method === "PATCH") {
    return handlePost(req, res);
  }

  res.setHeader("Allow", ["POST", "PATCH"]);
  return res.status(405).json({ error: "Method Not Allowed" });
}
