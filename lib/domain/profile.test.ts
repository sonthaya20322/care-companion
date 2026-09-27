import { describe, expect, it } from "vitest";
import { fieldErrorCodes, normalizePhone, onboardingSchema } from "./profile";

describe("normalizePhone", () => {
  it("strips spaces, dashes and dots", () => {
    expect(normalizePhone("081-234 5678")).toBe("0812345678");
    expect(normalizePhone("02.123.4567")).toBe("021234567");
  });
});

describe("onboardingSchema", () => {
  it("accepts a customer with a formatted mobile number", () => {
    const parsed = onboardingSchema.parse({ role: "customer", fullName: "  สมใจ ใจดี ", phone: "081-234-5678" });
    expect(parsed).toEqual({ role: "customer", fullName: "สมใจ ใจดี", phone: "0812345678" });
  });

  it("accepts a companion with a 9-digit landline", () => {
    expect(onboardingSchema.safeParse({ role: "companion", fullName: "มะลิ", phone: "021234567" }).success).toBe(true);
  });

  it("rejects self-assigning the admin role", () => {
    const result = onboardingSchema.safeParse({ role: "admin", fullName: "Eve", phone: "0812345678" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorCodes(result.error)).toMatchObject({ role: "INVALID_ROLE" });
  });

  it.each(["812345678", "08123", "08123456789", "abc1234567"])("rejects phone %s", (phone) => {
    const result = onboardingSchema.safeParse({ role: "customer", fullName: "สมใจ", phone });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorCodes(result.error)).toMatchObject({ phone: "INVALID_PHONE" });
  });

  it("rejects a name that is only whitespace", () => {
    const result = onboardingSchema.safeParse({ role: "customer", fullName: "   ", phone: "0812345678" });
    expect(result.success).toBe(false);
    if (!result.success) expect(fieldErrorCodes(result.error)).toMatchObject({ fullName: "INVALID_NAME" });
  });
});
