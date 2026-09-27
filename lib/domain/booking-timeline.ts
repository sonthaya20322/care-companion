import type { BookingStatus } from "./booking";

export type TimelineLog = {
  from_status: BookingStatus | null;
  to_status: BookingStatus;
  changed_by: string | null;
};

type Parties = { customerId: string; companionId: string | null };

/** Who made a change, phrased from the viewer's point of view. */
export function actorLabel(changedBy: string | null, parties: Parties, viewerId: string): string {
  if (!changedBy) return "ระบบ";
  if (changedBy === viewerId) return "คุณ";
  if (changedBy === parties.customerId) return "ผู้ใช้บริการ";
  if (changedBy === parties.companionId) return "ผู้ช่วย";
  return "ผู้ดูแลระบบ";
}

const verbs: Record<BookingStatus, string> = {
  requested: "ส่งคำขอ",
  accepted: "ตอบรับนัดหมาย",
  rejected: "ปฏิเสธคำขอ",
  in_progress: "เริ่มงาน",
  completed: "จบงาน",
  cancelled: "ยกเลิกนัดหมาย",
};

export function timelineText(log: TimelineLog, parties: Parties, viewerId: string): string {
  const confirmedByCustomer = log.to_status === "completed" && log.changed_by === parties.customerId;
  const verb = confirmedByCustomer ? "ยืนยันว่าจบงานแล้ว" : verbs[log.to_status];
  return `${actorLabel(log.changed_by, parties, viewerId)}${verb}`;
}

/** Only reasons typed by a person are shown; the RPCs also log internal notes on other transitions. */
export function visibleNote(log: TimelineLog & { note: string | null }): string | null {
  return log.to_status === "rejected" || log.to_status === "cancelled" ? log.note : null;
}

/** Phone and pickup address are shared only once a companion has confirmed. */
export function contactVisible(status: BookingStatus): boolean {
  return status === "accepted" || status === "in_progress" || status === "completed";
}
