import { describe, expect, it } from "vitest";
import { bookingActionSchema } from "./booking-action";

const id = "3f1c2b8a-5d7e-4a3b-9c1d-2e4f6a8b0c1d";

describe("bookingActionSchema", () => {
  it("parses a review with a coerced rating", () => {
    expect(bookingActionSchema.parse({ action: "review", bookingId: id, rating: "5", comment: " ดีมาก " })).toEqual({
      action: "review",
      bookingId: id,
      rating: 5,
      comment: "ดีมาก",
    });
  });

  it("defaults an empty cancel note", () => {
    expect(bookingActionSchema.parse({ action: "cancel", bookingId: id })).toMatchObject({ note: "", confirmLate: false });
    expect(bookingActionSchema.parse({ action: "cancel", bookingId: id, confirmLate: "on" })).toMatchObject({
      confirmLate: true,
    });
  });

  it.each([
    { action: "review", bookingId: id, rating: "6" },
    { action: "review", bookingId: id, rating: "0" },
    { action: "accept", bookingId: "not-a-uuid" },
    { action: "delete", bookingId: id },
  ])("rejects %o", (input) => {
    expect(bookingActionSchema.safeParse(input).success).toBe(false);
  });
});
