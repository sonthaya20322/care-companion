import { describe, expect, it } from "vitest";
import { bangkokDateString, bangkokLocalToDate, durationOptions, parseBookingForm } from "./booking-form";

const now = new Date("2026-10-01T01:00:00Z"); // 08:00 in Bangkok

const base = {
  companionId: "",
  errandTypeId: "1",
  date: "2026-10-02",
  time: "09:30",
  durationHours: "3",
  pickupDistrictId: "1006",
  pickupAddress: "99/1 ซอยลาดพร้าว 101",
  contactPhone: "081-234-5678",
  destinationName: "โรงพยาบาลรามาธิบดี",
  destinationAddress: "",
  destinationDistrictId: "",
  details: "  ",
  specialNeeds: "ใช้รถเข็น",
};

describe("bangkok time helpers", () => {
  it("converts Bangkok wall time to UTC", () => {
    expect(bangkokLocalToDate("2026-10-02", "09:30")?.toISOString()).toBe("2026-10-02T02:30:00.000Z");
  });

  it("rejects malformed input", () => {
    expect(bangkokLocalToDate("02/10/2026", "09:30")).toBeNull();
    expect(bangkokLocalToDate("2026-10-02", "9:30")).toBeNull();
  });

  it("gives the Bangkok calendar date near midnight UTC", () => {
    expect(bangkokDateString(new Date("2026-10-01T18:00:00Z"))).toBe("2026-10-02");
  });

  it("offers 1 to 12 hours in half-hour steps", () => {
    const options = durationOptions();
    expect(options[0]).toBe(1);
    expect(options.at(-1)).toBe(12);
    expect(options).toHaveLength(23);
  });
});

describe("parseBookingForm", () => {
  it("parses an open request and normalises optional fields", () => {
    const result = parseBookingForm(base, now);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data).toMatchObject({
      companionId: null,
      errandTypeId: 1,
      durationHours: 3,
      contactPhone: "0812345678",
      destinationAddress: null,
      destinationDistrictId: null,
      details: null,
      specialNeeds: "ใช้รถเข็น",
    });
    expect(result.data.startsAt.toISOString()).toBe("2026-10-02T02:30:00.000Z");
  });

  it("accepts a direct booking with a companion uuid", () => {
    const result = parseBookingForm({ ...base, companionId: "3f1c2b8a-5d7e-4a3b-9c1d-2e4f6a8b0c1d" }, now);
    expect(result.success).toBe(true);
  });

  it("rejects a non-uuid companion id", () => {
    expect(parseBookingForm({ ...base, companionId: "'; drop table" }, now).success).toBe(false);
  });

  it.each([
    [{ time: "09:30", date: "2026-10-01" }, "START_TOO_SOON"],
    [{ date: "2026-12-15" }, "START_TOO_FAR"],
    [{ durationHours: "1.25" }, "INVALID_DURATION"],
    [{ pickupAddress: " " }, "PICKUP_REQUIRED"],
    [{ destinationName: "" }, "DESTINATION_REQUIRED"],
    [{ contactPhone: "12345" }, "INVALID_PHONE"],
    [{ errandTypeId: "" }, "INVALID_ERRAND_TYPE"],
  ])("rejects %o with %s", (patch, code) => {
    const result = parseBookingForm({ ...base, ...patch }, now);
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((i) => i.message)).toContain(code);
  });
});
