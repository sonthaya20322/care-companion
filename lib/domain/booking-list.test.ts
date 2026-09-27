import { describe, expect, it } from "vitest";
import { countByStatus, findConflict, queryForDisplayStatus, splitBookings } from "./booking-list";

const now = new Date("2026-10-01T03:00:00Z");
const rows = [
  { id: "late", status: "accepted" as const, starts_at: "2026-10-05T02:00:00+00:00" },
  { id: "done", status: "completed" as const, starts_at: "2026-09-20T02:00:00+00:00" },
  { id: "soon", status: "requested" as const, starts_at: "2026-10-02T02:00:00+00:00" },
  { id: "expired", status: "requested" as const, starts_at: "2026-09-30T02:00:00+00:00" },
  { id: "running", status: "in_progress" as const, starts_at: "2026-10-01T02:00:00+00:00" },
  { id: "cancelled", status: "cancelled" as const, starts_at: "2026-10-10T02:00:00+00:00" },
  { id: "open", status: "requested" as const, starts_at: "2026-10-03T02:00:00+00:00", companion_id: null },
  { id: "noshow", status: "accepted" as const, starts_at: "2026-10-01T01:30:00+00:00" },
];

describe("splitBookings", () => {
  it("keeps actionable bookings upcoming, soonest first (overdue jobs still need a decision)", () => {
    expect(splitBookings(rows, now).upcoming.map((b) => b.id)).toEqual(["noshow", "running", "soon", "open", "late"]);
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
      open: 1,
      overdue: 1,
      expired: 1,
      in_progress: 1,
      cancelled: 1,
    });
  });
});

describe("queryForDisplayStatus", () => {
  it("splits stored requests into live and expired at the 1-hour deadline (bug A1)", () => {
    expect(queryForDisplayStatus("expired", now)).toEqual({
      status: "requested",
      startsAtOrBefore: new Date("2026-10-01T04:00:00Z"),
    });
    expect(queryForDisplayStatus("requested", now)).toEqual({
      status: "requested",
      companion: "assigned",
      startsAfter: new Date("2026-10-01T04:00:00Z"),
    });
    expect(queryForDisplayStatus("open", now).companion).toBe("none");
  });

  it("splits accepted jobs into on-time and overdue at 30 minutes past the start", () => {
    expect(queryForDisplayStatus("overdue", now)).toEqual({
      status: "accepted",
      startsAtOrBefore: new Date("2026-10-01T02:30:00Z"),
    });
    expect(queryForDisplayStatus("accepted", now).startsAfter).toEqual(new Date("2026-10-01T02:30:00Z"));
  });

  it("passes other statuses through unchanged", () => {
    expect(queryForDisplayStatus("cancelled", now)).toEqual({ status: "cancelled" });
  });

  it("agrees with displayStatus for every row", () => {
    for (const row of rows) {
      const shown = Object.keys(countByStatus([row], now))[0] as Parameters<typeof queryForDisplayStatus>[0];
      const q = queryForDisplayStatus(shown, now);
      const start = new Date(row.starts_at).getTime();
      expect(q.status).toBe(row.status);
      if (q.startsAfter) expect(start).toBeGreaterThan(q.startsAfter.getTime());
      if (q.startsAtOrBefore) expect(start).toBeLessThanOrEqual(q.startsAtOrBefore.getTime());
    }
  });
});

describe("findConflict", () => {
  // Bangkok 20:30 -> 08:30 next day, the overnight job from the reported bug.
  const job = { id: "night", status: "accepted" as const, starts_at: "2026-09-27T13:30:00Z", ends_at: "2026-09-28T01:30:00Z" };

  it("finds a confirmed job that overlaps the request", () => {
    const request = { starts_at: "2026-09-27T13:50:00Z", ends_at: "2026-09-27T14:50:00Z" };
    expect(findConflict(request, [job])?.id).toBe("night");
  });

  it("allows back-to-back times (end == start is not an overlap)", () => {
    const request = { starts_at: "2026-09-28T01:30:00Z", ends_at: "2026-09-28T03:30:00Z" };
    expect(findConflict(request, [job])).toBeNull();
  });

  it("ignores jobs that do not block the calendar", () => {
    const request = { starts_at: "2026-09-27T13:50:00Z", ends_at: "2026-09-27T14:50:00Z" };
    for (const status of ["requested", "completed", "cancelled", "rejected"] as const) {
      expect(findConflict(request, [{ ...job, status }])).toBeNull();
    }
    expect(findConflict(request, [{ ...job, status: "in_progress" as const }])?.id).toBe("night");
  });
});
