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
  START_TOO_SOON: "เวลาเริ่มต้องห่างจากตอนนี้อย่างน้อย 2 ชั่วโมง เพื่อให้ผู้ช่วยมีเวลาเดินทางมาหาคุณ",
  START_IN_PAST: "เวลาที่เลือกผ่านไปแล้ว กรุณาเลือกวันหรือเวลาใหม่",
  START_TOO_FAR: "จองล่วงหน้าได้ไม่เกิน 60 วัน",
  INVALID_DURATION: "ระยะเวลาต้องอยู่ระหว่าง 1-12 ชั่วโมง (ทีละครึ่งชั่วโมง)",
  INVALID_ERRAND_TYPE: "กรุณาเลือกประเภทธุระ",
  INVALID_DISTRICT: "กรุณาเลือกเขต/อำเภอของจุดรับ",
  MISSING_FIELDS: "กรุณากรอกข้อมูลที่จำเป็นให้ครบ",
  INVALID_INPUT: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่",
  BOOKING_NOT_FOUND: "ไม่พบนัดหมายนี้ หรือคุณไม่มีสิทธิ์เข้าถึง",
  BOOKING_NOT_AVAILABLE: "คำขอนี้มีผู้ช่วยรับไปแล้ว หรือหมดเวลาแล้ว",
  BOOKING_EXPIRED: "เลยเวลานัดหมายแล้ว",
  REQUEST_CLOSED: "คำขอนี้ปิดรับแล้ว เพราะเหลือเวลาน้อยกว่า 1 ชั่วโมงก่อนเวลานัด",
  NO_SHOW_TOO_EARLY: "แจ้งว่าผู้ช่วยไม่มาได้หลังเวลานัด 30 นาที",
  COMPLETE_TOO_EARLY: "ยืนยันจบงานได้หลังเวลาสิ้นสุดที่จองไว้",
  ROLE_RESET_HAS_BOOKINGS: "บัญชีนี้มีประวัตินัดหมายแล้ว จึงเปลี่ยนประเภทบัญชีไม่ได้",
  ROLE_RESET_NOT_ALLOWED: "รีเซ็ตประเภทบัญชีนี้ไม่ได้",
  ALREADY_REOPENED: "นัดนี้ถูกเปิดเป็นคำขอใหม่ไปแล้ว ดูได้ในหน้านัดหมายของฉัน",
  LATE_CANCEL_CONFIRM: "เหลือเวลาน้อยกว่า 2 ชั่วโมงก่อนนัด กรุณาระบุเหตุผลและยืนยันการยกเลิกอีกครั้ง",
  INVALID_TRANSITION: "ไม่สามารถทำรายการนี้ได้ในสถานะปัจจุบัน",
  TOO_EARLY_TO_START: "เริ่มงานได้ตั้งแต่ 1 ชั่วโมงก่อนเวลานัด",
  CANCEL_TOO_LATE: "ยกเลิกได้ก่อนเวลานัดอย่างน้อย 2 ชั่วโมง กรุณาติดต่อผู้ช่วยโดยตรง",
  INVALID_RATING: "กรุณาให้คะแนน 1-5 ดาว",
  ALREADY_REVIEWED: "คุณรีวิวนัดหมายนี้ไปแล้ว",
  BIO_TOO_LONG: "แนะนำตัวได้ไม่เกิน 1,500 ตัวอักษร",
  INVALID_EXPERIENCE: "กรุณากรอกประสบการณ์เป็นจำนวนปีเต็ม 0-60",
  INVALID_RATE: "อัตราค่าบริการต้องอยู่ระหว่าง 50-5,000 บาทต่อชั่วโมง",
  LANGUAGE_REQUIRED: "กรุณาระบุภาษาที่สื่อสารได้อย่างน้อย 1 ภาษา",
  TOO_MANY_TAGS: "ระบุได้ไม่เกิน 10 รายการ",
  TAG_TOO_LONG: "แต่ละรายการยาวได้ไม่เกิน 40 ตัวอักษร",
  INVALID_TIME: "กรุณาเลือกเวลาให้ถูกต้อง",
  END_BEFORE_START: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม",
  TOO_MANY_AREAS: "เลือกพื้นที่ได้ไม่เกิน 60 เขต",
  INVALID_FILE: "ไฟล์ไม่ถูกต้อง กรุณาเลือกรูปภาพ (JPG, PNG, WEBP) หรือ PDF ตามที่กำหนด",
  FILE_TOO_LARGE: "ไฟล์มีขนาดใหญ่เกินกำหนด",
  UPLOAD_FAILED: "อัปโหลดไฟล์ไม่สำเร็จ กรุณาลองใหม่",
  DATE_REQUIRED: "กรุณาเลือกวันที่นัดหมาย",
  TIME_REQUIRED: "กรุณาเลือกเวลานัดหมาย",
  PICKUP_REQUIRED: "กรุณากรอกที่อยู่จุดรับ",
  DESTINATION_REQUIRED: "กรุณากรอกชื่อสถานที่ปลายทาง",
  TEXT_TOO_LONG: "ข้อความยาวเกินกำหนด",
  ERRAND_NAME_REQUIRED: "กรุณากรอกชื่อประเภทธุระอย่างน้อย 2 ตัวอักษร",
  INVALID_SLUG: "รหัสใช้ได้เฉพาะ a-z, 0-9 และขีดกลาง (ไม่เกิน 40 ตัว)",
  INVALID_SORT_ORDER: "ลำดับต้องเป็นตัวเลข 0-999",
  SLUG_TAKEN: "รหัสนี้ถูกใช้แล้ว กรุณาใช้รหัสอื่น",
};

/** Same codes worded for the companion who triggered them (the defaults speak to customers). */
const companionMessages: Record<string, string> = {
  COMPANION_BUSY: "คุณมีงานอื่นที่ทับช่วงเวลานี้แล้ว จึงรับงานนี้ไม่ได้",
  COMPANION_NOT_IN_AREA: "คำขอนี้อยู่นอกพื้นที่ที่คุณให้บริการ",
};

export const fallbackErrorMessage = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";

/** Pulls a known error code out of a Supabase/PostgREST error and returns a Thai message. */
export function toUserMessage(error: unknown, audience?: "companion"): string {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : typeof error === "string"
        ? error
        : "";
  const code = message.match(/\b[A-Z][A-Z_]{3,}\b/)?.[0];
  if (!code) return fallbackErrorMessage;
  return (audience === "companion" && companionMessages[code]) || errorMessages[code] || fallbackErrorMessage;
}
