/** Thai messages for the error codes raised by the database RPC functions. */
export const errorMessages: Record<string, string> = {
  NOT_AUTHENTICATED: "กรุณาเข้าสู่ระบบก่อน",
  NOT_CUSTOMER: "เฉพาะผู้ใช้บริการเท่านั้นที่ทำรายการนี้ได้",
  NOT_COMPANION: "เฉพาะผู้ช่วยร่วมเดินทางเท่านั้นที่ทำรายการนี้ได้",
  NOT_ADMIN: "เฉพาะผู้ดูแลระบบเท่านั้นที่ทำรายการนี้ได้",
  INVALID_ROLE: "กรุณาเลือกประเภทบัญชี",
  INVALID_NAME: "กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร",
  INVALID_PHONE: "เบอร์โทรศัพท์ไม่ถูกต้อง กรุณากรอกตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0",
  ALREADY_ONBOARDED: "บัญชีนี้เลือกประเภทบัญชีไปแล้ว",
  PROFILE_NOT_FOUND: "ไม่พบข้อมูลบัญชี กรุณาออกจากระบบแล้วเข้าใหม่",
  DOCUMENT_REQUIRED: "กรุณาอัปโหลดเอกสารยืนยันตัวตนก่อนส่งตรวจสอบ",
  BIO_TOO_SHORT: "กรุณาเขียนแนะนำตัวอย่างน้อย 20 ตัวอักษร",
  SERVICE_AREA_REQUIRED: "กรุณาเลือกพื้นที่ให้บริการอย่างน้อย 1 เขต",
  COMPANION_NOT_FOUND: "ไม่พบผู้ช่วยคนนี้",
  COMPANION_NOT_APPROVED: "บัญชีผู้ช่วยของคุณยังไม่ได้รับการอนุมัติ",
  COMPANION_UNAVAILABLE: "ผู้ช่วยคนนี้ไม่พร้อมรับงานในขณะนี้",
  COMPANION_NOT_IN_AREA: "ผู้ช่วยคนนี้ไม่ได้ให้บริการในเขตที่เลือก",
  COMPANION_BUSY: "ผู้ช่วยมีนัดหมายอื่นในช่วงเวลานี้แล้ว",
  NOTE_REQUIRED: "กรุณาระบุเหตุผล",
  REASON_REQUIRED: "กรุณาระบุเหตุผลในการยกเลิก",
  CANNOT_CHANGE_SELF: "ไม่สามารถเปลี่ยนสถานะบัญชีของตัวเองได้",
  USER_NOT_FOUND: "ไม่พบผู้ใช้นี้",
  START_TOO_SOON: "กรุณาจองล่วงหน้าอย่างน้อย 2 ชั่วโมง",
  START_TOO_FAR: "จองล่วงหน้าได้ไม่เกิน 60 วัน",
  INVALID_DURATION: "ระยะเวลาต้องอยู่ระหว่าง 1-12 ชั่วโมง (ทีละครึ่งชั่วโมง)",
  INVALID_ERRAND_TYPE: "กรุณาเลือกประเภทธุระ",
  INVALID_DISTRICT: "กรุณาเลือกเขต/อำเภอของจุดรับ",
  MISSING_FIELDS: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
  BOOKING_NOT_FOUND: "ไม่พบนัดหมายนี้ หรือคุณไม่มีสิทธิ์เข้าถึง",
  BOOKING_NOT_AVAILABLE: "คำขอนี้มีผู้ช่วยรับไปแล้ว หรือหมดเวลาแล้ว",
  BOOKING_EXPIRED: "เลยเวลานัดหมายแล้ว",
  INVALID_TRANSITION: "ไม่สามารถทำรายการนี้ได้ในสถานะปัจจุบัน",
  TOO_EARLY_TO_START: "เริ่มงานได้ตั้งแต่ 1 ชั่วโมงก่อนเวลานัด",
  CANCEL_TOO_LATE: "ยกเลิกได้ก่อนเวลานัดอย่างน้อย 2 ชั่วโมง กรุณาติดต่อผู้ช่วยโดยตรง",
  INVALID_RATING: "กรุณาให้คะแนน 1-5 ดาว",
  ALREADY_REVIEWED: "คุณรีวิวนัดหมายนี้ไปแล้ว",
};

export const fallbackErrorMessage = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

/** Pulls a known error code out of a Supabase/PostgREST error and returns a Thai message. */
export function toUserMessage(error: unknown): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : typeof error === "string"
        ? error
        : "";
  const code = message.match(/\b[A-Z][A-Z_]{3,}\b/)?.[0];
  return (code && errorMessages[code]) || fallbackErrorMessage;
}
