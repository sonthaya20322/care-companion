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
} as const;

const HOUR = 60 * 60 * 1000;

export type StatusMeta = { label: string; tone: StatusTone; description: string };

export const bookingStatusMeta: Record<BookingStatus | "expired", StatusMeta> = {
  requested: { label: "รอตอบรับ", tone: "sora", description: "ส่งคำขอแล้ว รอผู้ช่วยตอบรับ" },
  accepted: { label: "ตอบรับแล้ว", tone: "matcha", description: "ผู้ช่วยยืนยันนัดหมายแล้ว" },
  in_progress: { label: "กำลังให้บริการ", tone: "fuji", description: "ผู้ช่วยกำลังพาไปทำธุระ" },
  completed: { label: "เสร็จสิ้น", tone: "sumi", description: "จบบริการเรียบร้อย" },
  rejected: { label: "ผู้ช่วยปฏิเสธ", tone: "beni", description: "ผู้ช่วยไม่สะดวกรับงานนี้" },
  cancelled: { label: "ยกเลิกแล้ว", tone: "beni", description: "นัดหมายนี้ถูกยกเลิก" },
  expired: { label: "หมดเวลา", tone: "yamabuki", description: "ถึงเวลานัดแล้วแต่ยังไม่มีผู้ช่วยตอบรับ" },
};

export type BookingSnapshot = {
  status: BookingStatus;
  customerId: string;
  companionId: string | null;
  startsAt: Date;
  hasReview?: boolean;
};

/** A request nobody accepted before its start time is shown as expired. */
export function displayStatus(booking: Pick<BookingSnapshot, "status" | "startsAt">, now: Date) {
  if (booking.status === "requested" && booking.startsAt.getTime() <= now.getTime()) return "expired";
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

export type BookingAction = "accept" | "reject" | "claim" | "start" | "complete" | "cancel" | "review";

export type Actor = { id: string; role: UserRole };

/** Actions the actor may take right now; the database enforces the same rules. */
export function availableActions(booking: BookingSnapshot, actor: Actor, now: Date): BookingAction[] {
  const actions: BookingAction[] = [];
  const msToStart = booking.startsAt.getTime() - now.getTime();
  const notStarted = msToStart > 0;

  if (actor.role === "admin") {
    if (["requested", "accepted", "in_progress"].includes(booking.status)) actions.push("cancel");
    return actions;
  }

  if (actor.role === "customer" && booking.customerId === actor.id) {
    if (booking.status === "requested" && notStarted) actions.push("cancel");
    if (booking.status === "accepted" && msToStart >= bookingRules.customerCancelCutoffHours * HOUR) {
      actions.push("cancel");
    }
    if (booking.status === "completed" && !booking.hasReview) actions.push("review");
    return actions;
  }

  if (actor.role === "companion") {
    if (booking.companionId === null) {
      if (booking.status === "requested" && notStarted) actions.push("claim");
      return actions;
    }
    if (booking.companionId !== actor.id) return actions;

    if (booking.status === "requested" && notStarted) actions.push("accept", "reject");
    if (booking.status === "accepted") {
      if (msToStart <= bookingRules.startWindowHours * HOUR) actions.push("start");
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
