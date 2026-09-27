export const TIME_ZONE = "Asia/Bangkok";

export const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"] as const;

// Built by hand instead of Intl so client components hydrate cleanly: Node and browsers ship
// different CLDR data (e.g. Node prints "จ." where Chrome prints "จันทร์").
const shortDayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."] as const;
const shortMonthNames = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
] as const;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
const pad2 = (n: number) => String(n).padStart(2, "0");

const dateFormat = new Intl.DateTimeFormat("th-TH", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "ศ. 3 ต.ค. 2569 09:30 น." in Bangkok time regardless of server time zone. */
export function formatDateTime(value: string | Date): string {
  const d = new Date(new Date(value).getTime() + BANGKOK_OFFSET_MS);
  const day = shortDayNames[d.getUTCDay()];
  const month = shortMonthNames[d.getUTCMonth()];
  const clock = `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  return `${day} ${d.getUTCDate()} ${month} ${d.getUTCFullYear() + 543} ${clock} น.`;
}

export function formatDate(value: string | Date): string {
  return dateFormat.format(new Date(value));
}

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Timestamp -> "14:30" in Bangkok time. */
export function formatClock(value: string | Date): string {
  return `${clockFormat.format(new Date(value))} น.`;
}

/** "09:00:00" (Postgres time) -> "09:00" */
export function formatTime(value: string): string {
  return value.slice(0, 5);
}

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours} ชั่วโมง` : `${Math.floor(hours)} ชั่วโมงครึ่ง`;
}
