import type { UserRole } from "./roles";

export type StatusTone = "sora" | "matcha" | "fuji" | "yamabuki" | "beni" | "sumi";

export type BookingStatus =
  | "requested"
  | "accepted"
  | "rejected"
  | "in_progress"
  | "completed"
  | "cancelled";

/** Must stay in sync with the checks in the booking RPC functions. */
export const bookingRules = {
  minLeadHours: 2,
  maxAdvanceDays: 60,
  minDurationHours: 1,
  maxDurationHours: 12,
  durationStepHours: 0.5,
  customerCancelCutoffHours: 2,
  startWindowHours: 1,
  /** Requests close this long before the start so the companion still has time to travel. */
  requestDeadlineHours: 1,
  /** After this many minutes past the start, the customer may report that the companion did not come. */
  noShowAfterMinutes: 30,
} as const;

const HOUR = 60 * 60 * 1000;
const MINUTE = 60 * 1000;

export type StatusMeta = { label: string; tone: StatusTone; description: string };

export type DisplayStatus = BookingStatus | "open" | "expired" | "overdue";

export const bookingStatusMeta: Record<DisplayStatus, StatusMeta> = {
  requested: {
    label: "รอตอบรับ",
    tone: "sora",
    description: `ส่งคำขอถึงผู้ช่วยแล้ว ผู้ช่วยตอบรับได้ถึง ${bookingRules.requestDeadlineHours} ชั่วโมงก่อนเวลานัด`,
  },
  open: {
    label: "รอผู้ช่วยรับงาน",
    tone: "sora",
    description: `คำขอแสดงให้ผู้ช่วยในพื้นที่เห็นแล้ว ปิดรับ ${bookingRules.requestDeadlineHours} ชั่วโมงก่อนเวลานัด`,
  },
  accepted: { label: "ตอบรับแล้ว", tone: "matcha", description: "ผู้ช่วยยืนยันนัดหมายแล้ว" },
  overdue: {
    label: "เลยเวลานัด",
    tone: "yamabuki",
    description: "เลยเวลานัดมาแล้ว แต่ผู้ช่วยยังไม่ได้กดเริ่มงาน",
  },
  in_progress: { label: "กำลังให้บริการ", tone: "fuji", description: "ผู้ช่วยกำลังพาไปทำธุระ" },
  completed: { label: "เสร็จสิ้น", tone: "sumi", description: "จบบริการเรียบร้อย" },
  rejected: { label: "ผู้ช่วยปฏิเสธ", tone: "beni", description: "ผู้ช่วยไม่สะดวกรับงานนี้" },
  cancelled: { label: "ยกเลิกแล้ว", tone: "beni", description: "นัดหมายนี้ถูกยกเลิก" },
  expired: {
    label: "หมดเวลา",
    tone: "yamabuki",
    description: `ไม่มีผู้ช่วยตอบรับภายใน ${bookingRules.requestDeadlineHours} ชั่วโมงก่อนเวลานัด คำขอนี้จึงปิดแล้ว`,
  },
};

export type BookingSnapshot = {
  status: BookingStatus;
  customerId: string;
  companionId: string | null;
  startsAt: Date;
  endsAt: Date;
  hasReview?: boolean;
};

/** Requests may be accepted or claimed only before this moment. */
export function requestDeadline(startsAt: Date): Date {
  return new Date(startsAt.getTime() - bookingRules.requestDeadlineHours * HOUR);
}

/**
 * Status as people should read it. The database keeps `requested` / `accepted`; these views are
 * derived from time: a request past its deadline is expired, an accepted job well past its start
 * without being started is overdue, and a request with no companion is an open request.
 */
export function displayStatus(
  booking: Pick<BookingSnapshot, "status" | "startsAt"> & { companionId?: string | null },
  now: Date,
): DisplayStatus {
  if (booking.status === "requested") {
    if (now.getTime() >= requestDeadline(booking.startsAt).getTime()) return "expired";
    return booking.companionId === null ? "open" : "requested";
  }
  if (booking.status === "accepted" && now.getTime() >= booking.startsAt.getTime() + bookingRules.noShowAfterMinutes * MINUTE) {
    return "overdue";
  }
  return booking.status;
}

export function computeEndsAt(startsAt: Date, durationHours: number): Date {
  return new Date(startsAt.getTime() + durationHours * HOUR);
}

export function estimatePrice(hourlyRate: number | null, durationHours: number): number | null {
  if (hourlyRate == null) return null;
  return Math.round(hourlyRate * durationHours * 100) / 100;
}

export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

export type ScheduleError = "START_TOO_SOON" | "START_TOO_FAR" | "INVALID_DURATION";

export function validateSchedule(startsAt: Date, durationHours: number, now: Date): ScheduleError | null {
  const { minDurationHours, maxDurationHours, durationStepHours, minLeadHours, maxAdvanceDays } =
    bookingRules;
  const steps = durationHours / durationStepHours;
  if (
    !Number.isFinite(durationHours) ||
    durationHours < minDurationHours ||
    durationHours > maxDurationHours ||
    Math.abs(steps - Math.round(steps)) > 1e-9
  ) {
    return "INVALID_DURATION";
  }
  const lead = startsAt.getTime() - now.getTime();
  if (lead < minLeadHours * HOUR) return "START_TOO_SOON";
  if (lead > maxAdvanceDays * 24 * HOUR) return "START_TOO_FAR";
  return null;
}

export type BookingAction =
  | "accept"
  | "reject"
  | "claim"
  | "start"
  | "complete"
  | "cancel"
  | "review"
  | "no_show"
  | "confirm_complete";

export type Actor = { id: string; role: UserRole };

/** Actions the actor may take right now; the database enforces the same rules. */
export function availableActions(booking: BookingSnapshot, actor: Actor, now: Date): BookingAction[] {
  const actions: BookingAction[] = [];
  const t = now.getTime();
  const msToStart = booking.startsAt.getTime() - t;
  const open = booking.status === "requested" && t < requestDeadline(booking.startsAt).getTime();
  const ended = t >= booking.endsAt.getTime();

  if (actor.role === "admin") {
    if (["requested", "accepted", "in_progress"].includes(booking.status)) actions.push("cancel");
    return actions;
  }

  if (actor.role === "customer" && booking.customerId === actor.id) {
    if (open) actions.push("cancel");
    if (booking.status === "accepted" && msToStart >= bookingRules.customerCancelCutoffHours * HOUR) {
      actions.push("cancel");
    }
    if (booking.status === "accepted" && -msToStart >= bookingRules.noShowAfterMinutes * MINUTE) {
      actions.push("no_show");
    }
    if ((booking.status === "accepted" || booking.status === "in_progress") && ended) {
      actions.push("confirm_complete");
    }
    if (booking.status === "completed" && !booking.hasReview) actions.push("review");
    return actions;
  }

  if (actor.role === "companion") {
    if (booking.companionId === null) {
      if (open) actions.push("claim");
      return actions;
    }
    if (booking.companionId !== actor.id) return actions;

    if (open) actions.push("accept", "reject");
    if (booking.status === "accepted") {
      if (msToStart <= bookingRules.startWindowHours * HOUR && !ended) actions.push("start");
      actions.push("cancel");
    }
    if (booking.status === "in_progress") actions.push("complete");
  }

  return actions;
}

export function formatBaht(amount: number | null): string {
  if (amount == null) return "ตามอัตราของผู้ช่วยที่รับงาน";
  return new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 }).format(
    amount,
  );
}
