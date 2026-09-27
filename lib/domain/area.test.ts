import { describe, expect, it } from "vitest";
import { areaFilterValue, districtIdsFor, parseAreaFilter } from "./area";

const provinces = [
  { id: 10, districts: [{ id: 1001 }, { id: 1002 }] },
  { id: 12, districts: [{ id: 1201 }] },
];

describe("parseAreaFilter", () => {
  it("parses all / province / district and round-trips", () => {
    for (const value of ["", "p10", "1001"]) {
      expect(areaFilterValue(parseAreaFilter(value))).toBe(value);
    }
  });

  it("ignores junk and injection-looking values", () => {
    expect(parseAreaFilter("1001;drop table")).toEqual({ kind: "all" });
    expect(parseAreaFilter("px")).toEqual({ kind: "all" });
    expect(parseAreaFilter(["p12", "1001"])).toEqual({ kind: "province", id: 12 });
  });
});

describe("districtIdsFor", () => {
  it("expands a province into its districts", () => {
    expect(districtIdsFor({ kind: "province", id: 10 }, provinces)).toEqual([1001, 1002]);
  });

  it("returns an empty list for an unknown province so nothing matches", () => {
    expect(districtIdsFor({ kind: "province", id: 99 }, provinces)).toEqual([]);
  });

  it("returns undefined for all areas", () => {
    expect(districtIdsFor({ kind: "all" }, provinces)).toBeUndefined();
  });
});
