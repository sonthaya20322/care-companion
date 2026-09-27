export const TIME_ZONE = "Asia/Bangkok";

export const dayNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"] as const;

const dateTimeFormat = new Intl.DateTimeFormat("th-TH", {
  timeZone: TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat("th-TH", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "ศ. 3 ต.ค. 2569 09:30 น." in Bangkok time regardless of server time zone. */
export function formatDateTime(value: string | Date): string {
  return `${dateTimeFormat.format(new Date(value))} น.`;
}

export function formatDate(value: string | Date): string {
  return dateFormat.format(new Date(value));
}

/** "09:00:00" (Postgres time) -> "09:00" */
export function formatTime(value: string): string {
  return value.slice(0, 5);
}

export function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours} ชั่วโมง` : `${Math.floor(hours)} ชั่วโมงครึ่ง`;
}
