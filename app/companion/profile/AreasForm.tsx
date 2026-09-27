"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";
import type { ProvinceWithDistricts } from "@/lib/services/catalog";
import { saveServiceAreas } from "./actions";

export function AreasForm({ locations, selected }: { locations: ProvinceWithDistricts[]; selected: number[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveServiceAreas, {});
  const chosen = new Set(selected);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {locations.map((province, index) => (
        <details
          key={province.id}
          open={index === 0 || province.districts.some((d) => chosen.has(d.id))}
          className="group rounded-card ring-1 ring-washi-line"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between rounded-card px-4 font-medium text-sumi hover:bg-sakura-50 [&::-webkit-details-marker]:hidden">
            {province.name_th}
            <span className="text-sm font-normal text-sumi-soft">
              เลือกแล้ว {province.districts.filter((d) => chosen.has(d.id)).length} เขต
            </span>
          </summary>
          <fieldset className="grid gap-x-4 gap-y-1 px-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="sr-only">เขต/อำเภอใน{province.name_th}</legend>
            {province.districts.map((district) => (
              <label key={district.id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control px-2 hover:bg-sakura-50">
                <input
                  type="checkbox"
                  name="districtIds"
                  value={district.id}
                  defaultChecked={chosen.has(district.id)}
                  className="size-5 accent-sakura-600"
                />
                <span className="text-sumi">{district.name_th}</span>
              </label>
            ))}
          </fieldset>
        </details>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="กำลังบันทึก...">บันทึกพื้นที่ให้บริการ</SubmitButton>
        <FormStatus ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
