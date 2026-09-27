import { describe, expect, it } from "vitest";
import {
  availableActions,
  computeEndsAt,
  displayStatus,
  estimatePrice,
  rangesOverlap,
  validateSchedule,
  type BookingSnapshot,
} from "./booking";
import { toUserMessage } from "./errors";
import { homePathFor, requiredRoleForPath } from "./roles";

const now = new Date("2026-10-01T09:00:00+07:00");
const hours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000);

const customer = { id: "cus-1", role: "customer" as const };
const companion = { id: "com-1", role: "companion" as const };
const otherCompanion = { id: "com-2", role: "companion" as const };
const admin = { id: "adm-1", role: "admin" as const };

function booking(overrides: Partial<BookingSnapshot> = {}): BookingSnapshot {
  return {
    status: "requested",
    customerId: customer.id,
    companionId: companion.id,
    startsAt: hours(24),
    ...overrides,
  };
}

describe("validateSchedule", () => {
  it("accepts a booking 2+ hours ahead with a half-hour step duration", () => {
    expect(validateSchedule(hours(2), 1.5, now)).toBeNull();
  });

  it("rejects bookings less than 2 hours ahead", () => {
    expect(validateSchedule(hours(1.9), 2, now)).toBe("START_TOO_SOON");
  });

  it("rejects bookings more than 60 days ahead", () => {
    expect(validateSchedule(hours(24 * 61), 2, now)).toBe("START_TOO_FAR");
  });

  it.each([0.5, 12.5, 1.25, Number.NaN])("rejects duration %s", (duration) => {
    expect(validateSchedule(hours(5), duration, now)).toBe("INVALID_DURATION");
  });
});

describe("pricing and time helpers", () => {
  it("estimates price from hourly rate and duration", () => {
    expect(estimatePrice(250, 3)).toBe(750);
    expect(estimatePrice(199.5, 1.5)).toBe(299.25);
  });

  it("has no price for open requests until a companion accepts", () => {
    expect(estimatePrice(null, 3)).toBeNull();
  });

  it("computes the end time", () => {
    expect(computeEndsAt(now, 2.5).toISOString()).toBe(hours(2.5).toISOString());
  });

  it("treats touching ranges as not overlapping", () => {
    expect(rangesOverlap(hours(1), hours(3), hours(3), hours(5))).toBe(false);
    expect(rangesOverlap(hours(1), hours(3), hours(2.5), hours(5))).toBe(true);
  });

  it("shows unanswered past requests as expired", () => {
    expect(displayStatus({ status: "requested", startsAt: hours(-1) }, now)).toBe("expired");
    expect(displayStatus({ status: "accepted", startsAt: hours(-1) }, now)).toBe("accepted");
  });
});

describe("availableActions", () => {
  it("lets the assigned companion accept or reject a pending request", () => {
    expect(availableActions(booking(), companion, now)).toEqual(["accept", "reject"]);
  });

  it("gives other companions nothing on a direct request", () => {
    expect(availableActions(booking(), otherCompanion, now)).toEqual([]);
  });

  it("lets any companion claim an open request before it starts", () => {
    expect(availableActions(booking({ companionId: null }), otherCompanion, now)).toEqual(["claim"]);
    expect(availableActions(booking({ companionId: null, startsAt: hours(-1) }), otherCompanion, now)).toEqual(
      [],
    );
  });

  it("only allows starting within 1 hour of the start time", () => {
    expect(availableActions(booking({ status: "accepted", startsAt: hours(3) }), companion, now)).toEqual([
      "cancel",
    ]);
    expect(availableActions(booking({ status: "accepted", startsAt: hours(0.5) }), companion, now)).toEqual([
      "start",
      "cancel",
    ]);
  });

  it("lets the companion complete a job in progress", () => {
    expect(availableActions(booking({ status: "in_progress" }), companion, now)).toEqual(["complete"]);
  });

  it("lets the customer cancel an accepted booking only until 2 hours before", () => {
    expect(availableActions(booking({ status: "accepted", startsAt: hours(2) }), customer, now)).toEqual([
      "cancel",
    ]);
    expect(availableActions(booking({ status: "accepted", startsAt: hours(1.5) }), customer, now)).toEqual([]);
  });

  it("offers a review once, after completion", () => {
    expect(availableActions(booking({ status: "completed" }), customer, now)).toEqual(["review"]);
    expect(availableActions(booking({ status: "completed", hasReview: true }), customer, now)).toEqual([]);
  });

  it("never lets a different customer act", () => {
    expect(availableActions(booking(), { id: "cus-2", role: "customer" }, now)).toEqual([]);
  });

  it("lets admins cancel any active booking but not finished ones", () => {
    expect(availableActions(booking({ status: "in_progress" }), admin, now)).toEqual(["cancel"]);
    expect(availableActions(booking({ status: "completed" }), admin, now)).toEqual([]);
  });
});

describe("roles", () => {
  it("sends users without a role to onboarding", () => {
    expect(homePathFor(null)).toBe("/onboarding");
    expect(homePathFor("companion")).toBe("/companion");
  });

  it("maps protected paths to their role", () => {
    expect(requiredRoleForPath("/admin/users")).toBe("admin");
    expect(requiredRoleForPath("/customer")).toBe("customer");
    expect(requiredRoleForPath("/companions")).toBeNull();
  });
});

describe("toUserMessage", () => {
  it("maps database error codes to Thai", () => {
    expect(toUserMessage({ message: "COMPANION_BUSY" })).toBe("ผู้ช่วยมีนัดหมายอื่นในช่วงเวลานี้แล้ว");
  });

  it("falls back to a generic message for unknown errors", () => {
    expect(toUserMessage(new Error("socket hang up"))).toBe("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
  });
});
