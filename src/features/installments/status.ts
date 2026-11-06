export type InstallmentStatus = "Pagada" | "Vencida" | "A vencer" | "Pendiente";
export function localToday(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function installmentStatus(
  dueOn: string,
  settled: boolean,
  today: string = localToday(),
): InstallmentStatus {
  if (settled) return "Pagada";
  const difference =
    (Date.parse(dueOn + "T00:00:00Z") - Date.parse(today + "T00:00:00Z")) /
    86400000;
  if (!Number.isFinite(difference)) throw new Error("Invalid installment date");
  if (difference < 0) return "Vencida";
  return difference <= 5 ? "A vencer" : "Pendiente";
}
