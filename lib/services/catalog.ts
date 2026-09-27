import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type Province = { id: number; name_th: string };
export type District = { id: number; province_id: number; name_th: string };
export type ErrandType = {
  id: number;
  slug: string;
  name_th: string;
  description: string;
  is_active: boolean;
  sort_order: number;
};
export type ProvinceWithDistricts = Province & { districts: District[] };

function fail(what: string, error: { code?: string }): never {
  console.error(`${what} failed`, { code: error.code });
  throw new Error(`${what} failed`, { cause: error });
}

export const getLocations = cache(async (): Promise<ProvinceWithDistricts[]> => {
  const supabase = await createClient();
  const [provinces, districts] = await Promise.all([
    supabase.from("provinces").select("id, name_th").order("id"),
    supabase.from("districts").select("id, province_id, name_th").order("name_th"),
  ]);
  if (provinces.error) fail("load provinces", provinces.error);
  if (districts.error) fail("load districts", districts.error);

  return (provinces.data as Province[]).map((p) => ({
    ...p,
    districts: (districts.data as District[]).filter((d) => d.province_id === p.id),
  }));
});

/** District id -> "เขต, จังหวัด" label. */
export const getDistrictLabels = cache(async (): Promise<Map<number, string>> => {
  const locations = await getLocations();
  const labels = new Map<number, string>();
  for (const province of locations) {
    for (const district of province.districts) {
      labels.set(district.id, `${district.name_th}, ${province.name_th}`);
    }
  }
  return labels;
});

/** Active errand types for customers; admins see inactive ones too (RLS decides). */
export const getErrandTypes = cache(async (): Promise<ErrandType[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("errand_types")
    .select("id, slug, name_th, description, is_active, sort_order")
    .order("sort_order")
    .order("id");
  if (error) fail("load errand types", error);
  return data as ErrandType[];
});
