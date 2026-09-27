import { describe, expect, it } from "vitest";
import { areaFilterLabel, areaFilterValue, districtIdsFor, parseAreaFilter } from "./area";

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

describe("areaFilterLabel", () => {
  const named = [
    { id: 10, name_th: "กรุงเทพมหานคร", districts: [{ id: 1001, name_th: "พระนคร" }] },
    { id: 11, name_th: "สมุทรปราการ", districts: [{ id: 1101, name_th: "พระประแดง" }] },
  ];

  it("names the whole province or the district with its province", () => {
    expect(areaFilterLabel({ kind: "province", id: 10 }, named)).toBe("ทั้งกรุงเทพมหานคร");
    expect(areaFilterLabel({ kind: "district", id: 1101 }, named)).toBe("พระประแดง, สมุทรปราการ");
  });

  it("returns null for all areas or unknown ids", () => {
    expect(areaFilterLabel({ kind: "all" }, named)).toBeNull();
    expect(areaFilterLabel({ kind: "province", id: 99 }, named)).toBeNull();
    expect(areaFilterLabel({ kind: "district", id: 9999 }, named)).toBeNull();
  });
});
