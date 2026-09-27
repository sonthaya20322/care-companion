import { describe, expect, it } from "vitest";
import { requiresAuth, safeNextPath } from "./access";

describe("requiresAuth", () => {
  it.each(["/customer", "/customer/bookings/1", "/companion", "/admin/users", "/onboarding"])(
    "protects %s",
    (path) => expect(requiresAuth(path)).toBe(true),
  );

  it.each(["/", "/login", "/companions", "/companions/abc", "/privacy", "/customers", "/administer"])(
    "leaves %s public",
    (path) => expect(requiresAuth(path)).toBe(false),
  );
});

describe("safeNextPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeNextPath("/customer/bookings?tab=active")).toBe("/customer/bookings?tab=active");
  });

  it("falls back when empty", () => {
    expect(safeNextPath(null)).toBe("/");
    expect(safeNextPath("", "/onboarding")).toBe("/onboarding");
  });

  it.each([
    "https://evil.example",
    "//evil.example",
    "/\\evil.example",
    "javascript:alert(1)",
    "customer",
    "/ok\nSet-Cookie:x",
  ])("rejects open-redirect attempt %s", (next) => {
    expect(safeNextPath(next)).toBe("/");
  });
});
