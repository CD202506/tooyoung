export function toMonthKey(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}
