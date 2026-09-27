import { describe, expect, it } from "vitest";
import {
  activeBookingCount,
  errandTypeSchema,
  parseDashboardStats,
  reviewDecisionSchema,
  sanitizeSearch,
  sumCounts,
} from "./admin";

const id = "3f1c2b8a-5d7e-4a3b-9c1d-2e4f6a8b0c1d";

describe("reviewDecisionSchema", () => {
  it("approves without a note", () => {
    expect(reviewDecisionSchema.safeParse({ companionId: id, decision: "approve" }).success).toBe(true);
  });

  it("requires a note to reject", () => {
    const result = reviewDecisionSchema.safeParse({ companionId: id, decision: "reject", note: "  " });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]).toMatchObject({ message: "NOTE_REQUIRED", path: ["note"] });
  });

  it("rejects unknown decisions", () => {
    expect(reviewDecisionSchema.safeParse({ companionId: id, decision: "maybe" }).success).toBe(false);
  });
});

describe("errandTypeSchema", () => {
  const base = { name_th: "ซื้อของ", slug: "Shopping-Trip", description: "", sort_order: "3" };

  it("normalizes slug, coerces numbers and reads the checkbox", () => {
    expect(errandTypeSchema.parse({ ...base, is_active: "on" })).toEqual({
      id: undefined,
      name_th: "ซื้อของ",
      slug: "shopping-trip",
      description: "",
      sort_order: 3,
      is_active: true,
    });
  });

  it("treats a missing checkbox as inactive and keeps an id for edits", () => {
    expect(errandTypeSchema.parse({ ...base, id: "7" })).toMatchObject({ id: 7, is_active: false });
  });

  it.each([
    [{ slug: "bad slug" }, "INVALID_SLUG"],
    [{ slug: "-lead" }, "INVALID_SLUG"],
    [{ name_th: "ก" }, "ERRAND_NAME_REQUIRED"],
    [{ sort_order: "-1" }, "INVALID_SORT_ORDER"],
  ])("rejects %o", (patch, code) => {
    const result = errandTypeSchema.safeParse({ ...base, ...patch });
    expect(result.error?.issues[0]?.message).toBe(code);
  });
});

describe("sanitizeSearch", () => {
  it("strips PostgREST filter syntax", () => {
    expect(sanitizeSearch("a,b)or(role.eq.admin*")).toBe("a b or role eq admin");
  });

  it("trims, caps length and ignores non-strings", () => {
    expect(sanitizeSearch("  สมใจ   ใจดี ")).toBe("สมใจ ใจดี");
    expect(sanitizeSearch("x".repeat(100))).toHaveLength(60);
    expect(sanitizeSearch(["a"])).toBe("");
  });
});

describe("parseDashboardStats", () => {
  it("coerces numbers and fills missing keys", () => {
    const stats = parseDashboardStats({
      users_by_role: { customer: "3", companion: 2 },
      bookings_last_14_days: [{ day: "2026-09-27", total: "4" }],
      average_rating: "4.50",
    });
    expect(stats.users_by_role).toEqual({ customer: 3, companion: 2 });
    expect(stats.bookings_last_14_days).toEqual([{ day: "2026-09-27", total: 4 }]);
    expect(stats.average_rating).toBe(4.5);
    expect(stats.bookings_by_status).toEqual({});
    expect(stats.suspended_users).toBe(0);
  });

  it("survives null", () => {
    expect(parseDashboardStats(null).bookings_by_errand).toEqual([]);
  });
});

describe("sumCounts", () => {
  it("sums all or selected keys", () => {
    expect(sumCounts({ a: 1, b: 2, c: 3 })).toBe(6);
    expect(sumCounts({ a: 1, b: 2, c: 3 }, ["a", "c"])).toBe(4);
  });
});

describe("activeBookingCount", () => {
  it("does not count expired requests as active (bug A1)", () => {
    const bookings_by_status = { requested: 5, accepted: 2, in_progress: 1, completed: 9 };
    expect(activeBookingCount({ bookings_by_status, expired_requests: 3 })).toBe(5);
    expect(activeBookingCount({ bookings_by_status, expired_requests: 0 })).toBe(8);
  });

  it("reads the new counts from the RPC", () => {
    const stats = parseDashboardStats({ expired_requests: "2", overdue_jobs: 1 });
    expect(stats.expired_requests).toBe(2);
    expect(stats.overdue_jobs).toBe(1);
  });
});
