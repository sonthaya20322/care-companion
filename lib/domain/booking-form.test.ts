import { describe, expect, it } from "vitest";
import {
  bangkokDateString,
  bangkokLocalToDate,
  bangkokTimeString,
  checkStart,
  defaultStart,
  durationOptions,
  earliestStart,
  fitsAvailability,
  overlappingRanges,
  parseBookingForm,
  ratesByDistrict,
  summarizeAreaRates,
} from "./booking-form";

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
    [{ time: "07:00", date: "2026-10-01" }, "START_IN_PAST"],
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

  it("treats an empty or missing budget as any rate", () => {
    const empty = parseBookingForm({ ...base, maxHourlyRate: " " }, now);
    const missing = parseBookingForm(base, now);
    expect(empty.success && empty.data.maxHourlyRate).toBeNull();
    expect(missing.success && missing.data.maxHourlyRate).toBeNull();
  });

  it("keeps a budget on an open request", () => {
    const result = parseBookingForm({ ...base, maxHourlyRate: "300" }, now);
    expect(result.success && result.data.maxHourlyRate).toBe(300);
  });

  it("drops the budget on a direct request, where the companion's rate is already known", () => {
    const result = parseBookingForm(
      { ...base, companionId: "3f1c2b8a-5d7e-4a3b-9c1d-2e4f6a8b0c1d", maxHourlyRate: "300" },
      now,
    );
    expect(result.success && result.data.maxHourlyRate).toBeNull();
  });

  it.each(["49", "5001", "250.5", "abc"])("rejects budget %s with INVALID_BUDGET", (maxHourlyRate) => {
    const result = parseBookingForm({ ...base, maxHourlyRate }, now);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message)).toContain("INVALID_BUDGET");
      expect(result.error.issues[0].path).toEqual(["maxHourlyRate"]);
    }
  });

  it("points start-time problems at the field the user should change", () => {
    const soon = parseBookingForm({ ...base, date: "2026-10-01", time: "09:30" }, now);
    const far = parseBookingForm({ ...base, date: "2026-12-15" }, now);
    expect(soon.success ? null : soon.error.issues[0].path).toEqual(["time"]);
    expect(far.success ? null : far.error.issues[0].path).toEqual(["date"]);
  });
});

describe("start time helpers", () => {
  it("rounds the earliest start up to the next half hour after the lead time", () => {
    expect(bangkokTimeString(earliestStart(new Date("2026-10-01T01:10:00Z")))).toBe("10:30");
    expect(bangkokTimeString(earliestStart(new Date("2026-10-01T01:00:00Z")))).toBe("10:00");
  });

  it.each([
    ["early morning -> 09:00 same day", "2026-09-30T23:00:00Z", { date: "2026-10-01", time: "09:00" }],
    ["afternoon -> earliest slot", "2026-10-01T05:05:00Z", { date: "2026-10-01", time: "14:30" }],
    ["evening -> next morning", "2026-10-01T11:05:00Z", { date: "2026-10-02", time: "09:00" }],
    ["late night crosses midnight", "2026-10-01T16:40:00Z", { date: "2026-10-02", time: "09:00" }],
  ])("defaultStart: %s", (_label, iso, expected) => {
    expect(defaultStart(new Date(iso))).toEqual(expected);
  });

  it("separates past, too soon, too far and fine", () => {
    expect(checkStart(new Date("2026-10-01T00:30:00Z"), now)).toBe("START_IN_PAST");
    expect(checkStart(new Date("2026-10-01T02:00:00Z"), now)).toBe("START_TOO_SOON");
    expect(checkStart(new Date("2026-12-15T02:00:00Z"), now)).toBe("START_TOO_FAR");
    expect(checkStart(new Date("2026-10-01T03:00:00Z"), now)).toBeNull();
  });
});

describe("booking warnings", () => {
  const at = (date: string, time: string) => bangkokLocalToDate(date, time)!;
  const range = (date: string, from: string, to: string) => ({ startsAt: at(date, from), endsAt: at(date, to) });

  it("finds the customer's own bookings that overlap the chosen time (A5)", () => {
    const chosen = range("2026-10-02", "09:00", "12:00");
    const others = [
      range("2026-10-02", "11:00", "13:00"),
      range("2026-10-02", "12:00", "14:00"),
      range("2026-10-03", "09:00", "12:00"),
    ];
    expect(overlappingRanges(chosen, others)).toEqual([others[0]]);
  });

  // 2026-10-02 is a Friday (day 5)
  const slots = [{ day_of_week: 5, start_time: "08:00:00", end_time: "17:00:00" }];

  it("fits a booking inside the companion's hours in Bangkok time", () => {
    expect(fitsAvailability(range("2026-10-02", "09:00", "12:00"), slots)).toBe(true);
    expect(fitsAvailability(range("2026-10-02", "14:00", "17:00"), slots)).toBe(true);
  });

  it("flags a booking that runs past the slot or falls on another day", () => {
    expect(fitsAvailability(range("2026-10-02", "15:00", "18:00"), slots)).toBe(false);
    expect(fitsAvailability(range("2026-10-02", "07:30", "09:00"), slots)).toBe(false);
    expect(fitsAvailability(range("2026-10-03", "09:00", "12:00"), slots)).toBe(false);
  });

  it("has nothing to say when the companion has not set any hours", () => {
    expect(fitsAvailability(range("2026-10-02", "09:00", "12:00"), [])).toBeNull();
  });
});

describe("area price range for open requests", () => {
  const rates = ratesByDistrict([
    { hourly_rate: 200, district_ids: [1006, 1007] },
    { hourly_rate: 350, district_ids: [1006] },
    { hourly_rate: 250, district_ids: [1006] },
  ]);

  it("groups rates under every district a companion serves", () => {
    expect(rates).toEqual({ 1006: [200, 350, 250], 1007: [200] });
  });

  it("summarises the range and counts everyone when there is no budget", () => {
    expect(summarizeAreaRates(rates, 1006, null)).toEqual({ count: 3, min: 200, max: 350, withinBudget: 3 });
  });

  it("counts companions at or under the budget", () => {
    expect(summarizeAreaRates(rates, 1006, 250)?.withinBudget).toBe(2);
    expect(summarizeAreaRates(rates, 1006, 100)?.withinBudget).toBe(0);
  });

  it("reports an empty district and nothing before a district is chosen", () => {
    expect(summarizeAreaRates(rates, 9999, 300)).toEqual({ count: 0, min: 0, max: 0, withinBudget: 0 });
    expect(summarizeAreaRates(rates, null, 300)).toBeNull();
  });
});
