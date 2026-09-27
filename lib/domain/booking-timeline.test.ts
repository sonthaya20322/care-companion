import { describe, expect, it } from "vitest";
import { actorLabel, contactVisible, timelineText, visibleNote } from "./booking-timeline";

const parties = { customerId: "cust", companionId: "comp" };

describe("actorLabel", () => {
  it("names the viewer as คุณ", () => {
    expect(actorLabel("cust", parties, "cust")).toBe("คุณ");
  });

  it("names the other party by role", () => {
    expect(actorLabel("comp", parties, "cust")).toBe("ผู้ช่วย");
    expect(actorLabel("cust", parties, "comp")).toBe("ผู้ใช้บริการ");
  });

  it("falls back to admin for anyone else and system for null", () => {
    expect(actorLabel("someone", parties, "cust")).toBe("ผู้ดูแลระบบ");
    expect(actorLabel(null, parties, "cust")).toBe("ระบบ");
  });

  it("does not treat an open booking's null companion as a match", () => {
    expect(actorLabel("x", { customerId: "cust", companionId: null }, "cust")).toBe("ผู้ดูแลระบบ");
  });
});

describe("timelineText", () => {
  it("joins actor and verb", () => {
    expect(timelineText({ from_status: "requested", to_status: "accepted", changed_by: "comp" }, parties, "cust")).toBe(
      "ผู้ช่วยตอบรับนัดหมาย",
    );
  });

  it("says the customer confirmed when they close the job themselves", () => {
    const log = { from_status: "in_progress" as const, to_status: "completed" as const, changed_by: "cust" };
    expect(timelineText(log, parties, "cust")).toBe("คุณยืนยันว่าจบงานแล้ว");
    expect(timelineText(log, parties, "comp")).toBe("ผู้ใช้บริการยืนยันว่าจบงานแล้ว");
    expect(timelineText({ ...log, changed_by: "comp" }, parties, "cust")).toBe("ผู้ช่วยจบงาน");
  });
});

describe("visibleNote", () => {
  it("shows reasons for reject and cancel only", () => {
    expect(visibleNote({ from_status: "accepted", to_status: "cancelled", changed_by: "x", note: "ป่วย" })).toBe("ป่วย");
    expect(visibleNote({ from_status: "requested", to_status: "rejected", changed_by: "x", note: "ไม่ว่าง" })).toBe("ไม่ว่าง");
    expect(visibleNote({ from_status: null, to_status: "requested", changed_by: "x", note: "open request" })).toBeNull();
    expect(
      visibleNote({ from_status: "requested", to_status: "accepted", changed_by: "x", note: "claimed open request" }),
    ).toBeNull();
  });
});

describe("contactVisible", () => {
  it.each([
    ["requested", false],
    ["accepted", true],
    ["in_progress", true],
    ["completed", true],
    ["rejected", false],
    ["cancelled", false],
  ] as const)("%s → %s", (status, expected) => {
    expect(contactVisible(status)).toBe(expected);
  });
});
