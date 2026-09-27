import { describe, expect, it } from "vitest";
import {
  availabilitySlotSchema,
  canSubmitVerification,
  companionProfileSchema,
  parseTags,
  serviceAreaRequired,
  serviceAreasSchema,
  verificationChecklist,
} from "./companion";

describe("serviceAreaRequired", () => {
  it("กันผู้ช่วยที่แสดงในหน้าค้นหาหรือรอตรวจ ไม่ให้เหลือ 0 เขต", () => {
    expect(serviceAreaRequired("approved")).toBe(true);
    expect(serviceAreaRequired("pending")).toBe(true);
  });

  it("ผู้ช่วยที่ยังไม่ส่งตรวจหรือไม่ผ่าน ล้างพื้นที่ได้", () => {
    expect(serviceAreaRequired("draft")).toBe(false);
    expect(serviceAreaRequired("rejected")).toBe(false);
  });
});

const validProfile = {
  bio: "ใจเย็น เคยดูแลคุณยายที่บ้าน พาไปโรงพยาบาลประจำ",
  experienceYears: "3",
  hourlyRate: "250",
  skills: "เข็นรถเข็น, ติดต่อเวชระเบียน",
  languages: "ไทย, English",
  hasVehicle: true,
};

describe("parseTags", () => {
  it("splits on commas and new lines, trims and removes duplicates", () => {
    expect(parseTags(" ไทย, English ,ไทย\nจีน ,, ")).toEqual(["ไทย", "English", "จีน"]);
  });
});

describe("companionProfileSchema", () => {
  it("coerces form strings into numbers and tag lists", () => {
    expect(companionProfileSchema.parse(validProfile)).toMatchObject({
      experienceYears: 3,
      hourlyRate: 250,
      skills: ["เข็นรถเข็น", "ติดต่อเวชระเบียน"],
      languages: ["ไทย", "English"],
    });
  });

  it.each([
    [{ hourlyRate: "49" }, "INVALID_RATE"],
    [{ hourlyRate: "abc" }, "INVALID_RATE"],
    [{ experienceYears: "2.5" }, "INVALID_EXPERIENCE"],
    [{ experienceYears: "-1" }, "INVALID_EXPERIENCE"],
    [{ languages: " , " }, "LANGUAGE_REQUIRED"],
    [{ bio: "ก".repeat(1501) }, "BIO_TOO_LONG"],
    [{ skills: Array.from({ length: 11 }, (_, i) => `s${i}`).join(",") }, "TOO_MANY_TAGS"],
  ])("rejects %o with %s", (patch, code) => {
    const result = companionProfileSchema.safeParse({ ...validProfile, ...patch });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe(code);
  });
});

describe("availabilitySlotSchema", () => {
  it("accepts a morning slot", () => {
    expect(availabilitySlotSchema.safeParse({ dayOfWeek: 1, startTime: "08:00", endTime: "12:00" }).success).toBe(true);
  });

  it("rejects an end time before the start time", () => {
    const result = availabilitySlotSchema.safeParse({ dayOfWeek: 1, startTime: "12:00", endTime: "08:00" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].message).toBe("END_BEFORE_START");
  });

  it("rejects malformed times", () => {
    expect(availabilitySlotSchema.safeParse({ dayOfWeek: 1, startTime: "24:00", endTime: "25:00" }).success).toBe(false);
  });
});

describe("serviceAreasSchema", () => {
  it("dedupes ids from checkbox values", () => {
    expect(serviceAreasSchema.parse(["1001", "1002", "1001"])).toEqual([1001, 1002]);
  });
});

describe("verification checklist", () => {
  const complete = verificationChecklist({ bio: "x".repeat(20), areaCount: 2, documentPath: "uid/id.pdf" });

  it("is complete only with bio, area and document", () => {
    expect(complete).toEqual({ bio: true, serviceArea: true, document: true });
    expect(verificationChecklist({ bio: "สั้นไป", areaCount: 0, documentPath: null })).toEqual({
      bio: false,
      serviceArea: false,
      document: false,
    });
  });

  it("allows submitting from draft or rejected, never while pending or approved", () => {
    expect(canSubmitVerification("draft", complete)).toBe(true);
    expect(canSubmitVerification("rejected", complete)).toBe(true);
    expect(canSubmitVerification("pending", complete)).toBe(false);
    expect(canSubmitVerification("approved", complete)).toBe(false);
  });
});
