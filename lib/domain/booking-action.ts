import { z } from "zod";

/** Form payload for every booking transition; the RPC re-checks who may do what. */
export const bookingActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("accept"), bookingId: z.uuid() }),
  z.object({ action: z.literal("claim"), bookingId: z.uuid() }),
  z.object({ action: z.literal("start"), bookingId: z.uuid() }),
  z.object({ action: z.literal("complete"), bookingId: z.uuid() }),
  z.object({ action: z.literal("no_show"), bookingId: z.uuid() }),
  z.object({ action: z.literal("confirm_complete"), bookingId: z.uuid() }),
  z.object({ action: z.literal("reopen"), bookingId: z.uuid() }),
  z.object({
    action: z.literal("reject"),
    bookingId: z.uuid(),
    note: z.string().trim().max(500, "TEXT_TOO_LONG").optional().default(""),
  }),
  z.object({
    action: z.literal("cancel"),
    bookingId: z.uuid(),
    note: z.string().trim().max(500, "TEXT_TOO_LONG").optional().default(""),
  }),
  z.object({
    action: z.literal("review"),
    bookingId: z.uuid(),
    rating: z.coerce.number({ error: "INVALID_RATING" }).int("INVALID_RATING").min(1, "INVALID_RATING").max(5, "INVALID_RATING"),
    comment: z.string().trim().max(1000, "TEXT_TOO_LONG").optional().default(""),
  }),
]);

export type BookingActionInput = z.infer<typeof bookingActionSchema>;

export const actionSuccessMessages: Record<BookingActionInput["action"], string> = {
  accept: "ตอบรับงานแล้ว",
  reject: "ปฏิเสธคำขอแล้ว",
  claim: "รับงานแล้ว ดูข้อมูลติดต่อได้ในหน้ารายละเอียด",
  start: "เริ่มงานแล้ว",
  complete: "บันทึกว่าจบงานแล้ว ขอบคุณที่ดูแลอย่างดี",
  cancel: "ยกเลิกนัดหมายแล้ว",
  review: "ขอบคุณสำหรับรีวิว",
  no_show: "ปิดนัดแล้ว ขออภัยในความไม่สะดวก ผู้ดูแลระบบจะตรวจสอบรายการนี้",
  confirm_complete: "ยืนยันจบงานแล้ว ให้คะแนนผู้ช่วยได้เลย",
  reopen: "เปิดเป็นคำขอให้ผู้ช่วยคนอื่นแล้ว",
};
