import { describe, expect, it } from "vitest";
import { formatClock, formatDateTime, formatHours, formatTime } from "./format";

describe("format", () => {
  it("shows Bangkok time even for a UTC timestamp", () => {
    expect(formatDateTime("2026-10-02T02:30:00Z")).toContain("09:30");
  });

  it("shows the Bangkok clock time of a timestamp, past midnight UTC too", () => {
    expect(formatClock("2026-10-02T02:30:00Z")).toBe("09:30 น.");
    expect(formatClock("2026-10-02T17:05:00Z")).toBe("00:05 น.");
  });

  it("trims seconds from Postgres time", () => {
    expect(formatTime("08:30:00")).toBe("08:30");
  });

  it("reads half hours naturally in Thai", () => {
    expect(formatHours(3)).toBe("3 ชั่วโมง");
    expect(formatHours(2.5)).toBe("2 ชั่วโมงครึ่ง");
  });
});
