import type { ComponentProps } from "react";
import { Select } from "@/components/ui/Field";
import type { ProvinceWithDistricts } from "@/lib/services/catalog";

type AreaSelectProps = Omit<ComponentProps<"select">, "children"> & {
  locations: ProvinceWithDistricts[];
  /** Adds "ทุกพื้นที่" and whole-province options for search filters. */
  allowProvince?: boolean;
  placeholder?: string;
};

/** District picker grouped by province; works without JavaScript. */
export function AreaSelect({ locations, allowProvince = false, placeholder, ...props }: AreaSelectProps) {
  return (
    <Select {...props}>
      {allowProvince ? <option value="">ทุกพื้นที่</option> : <option value="">{placeholder ?? "เลือกเขต/อำเภอ"}</option>}
      {locations.map((province) => (
        <optgroup key={province.id} label={province.name_th}>
          {allowProvince && <option value={`p${province.id}`}>ทั้ง{province.name_th}</option>}
          {province.districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name_th}
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  );
}
