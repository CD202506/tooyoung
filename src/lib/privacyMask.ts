export function maskName(name?: string | null) {
  if (!name) return "某個案";
  if (name.length <= 2) return `${name[0] ?? "某"}某`;
  return `${name[0]}${"＊".repeat(Math.max(name.length - 2, 1))}${name[name.length - 1]}`;
}

export function maskHospital(hospital?: string | null) {
  if (!hospital) return "某醫療院所";
  return "某醫療院所";
}

export function maskDoctor(doctor?: string | null) {
  if (!doctor) return "某醫師";
  return "某醫師";
}

export function maskCaregiverLabel(index: number) {
  if (index === 0) return "主要照護者";
  const label = String.fromCharCode("A".charCodeAt(0) + index);
  return `照護者 ${label}`;
}

export function maskSensitiveText(text?: string | null) {
  if (!text) return "";
  return text
    .replace(/醫院/g, "某醫院")
    .replace(/醫師/g, "某醫師")
    .replace(/醫生/g, "某醫師")
    .replace(/診所/g, "某醫療院所");
}
