import { describe, expect, it } from "vitest";
import { countByStatus, splitBookings } from "./booking-list";

const now = new Date("2026-10-01T03:00:00Z");
const rows = [
  { id: "late", status: "accepted" as const, starts_at: "2026-10-05T02:00:00+00:00" },
  { id: "done", status: "completed" as const, starts_at: "2026-09-20T02:00:00+00:00" },
  { id: "soon", status: "requested" as const, starts_at: "2026-10-02T02:00:00+00:00" },
  { id: "expired", status: "requested" as const, starts_at: "2026-09-30T02:00:00+00:00" },
  { id: "running", status: "in_progress" as const, starts_at: "2026-10-01T02:00:00+00:00" },
  { id: "cancelled", status: "cancelled" as const, starts_at: "2026-10-10T02:00:00+00:00" },
];

describe("splitBookings", () => {
  it("keeps actionable bookings upcoming, soonest first", () => {
    expect(splitBookings(rows, now).upcoming.map((b) => b.id)).toEqual(["running", "soon", "late"]);
  });

  it("moves finished, cancelled and expired requests to history in original order", () => {
    expect(splitBookings(rows, now).past.map((b) => b.id)).toEqual(["done", "expired", "cancelled"]);
  });
});

describe("countByStatus", () => {
  it("counts by display status", () => {
    expect(countByStatus(rows, now)).toEqual({
      accepted: 1,
      completed: 1,
      requested: 1,
      expired: 1,
      in_progress: 1,
      cancelled: 1,
    });
  });
});
