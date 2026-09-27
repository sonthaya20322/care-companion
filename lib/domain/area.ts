export type AreaFilter = { kind: "all" } | { kind: "province"; id: number } | { kind: "district"; id: number };

/** Parses the `?area=` search param: "" = all, "p10" = a whole province, "1001" = one district. */
export function parseAreaFilter(value: string | string[] | undefined): AreaFilter {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return { kind: "all" };
  const province = /^p(\d{1,4})$/.exec(raw);
  if (province) return { kind: "province", id: Number(province[1]) };
  if (/^\d{1,6}$/.test(raw)) return { kind: "district", id: Number(raw) };
  return { kind: "all" };
}

export function areaFilterValue(filter: AreaFilter): string {
  if (filter.kind === "province") return `p${filter.id}`;
  if (filter.kind === "district") return String(filter.id);
  return "";
}

/** District ids the filter covers, or undefined for "everywhere". */
export function districtIdsFor(
  filter: AreaFilter,
  provinces: { id: number; districts: { id: number }[] }[],
): number[] | undefined {
  if (filter.kind === "district") return [filter.id];
  if (filter.kind === "province") {
    return provinces.find((p) => p.id === filter.id)?.districts.map((d) => d.id) ?? [];
  }
  return undefined;
}
