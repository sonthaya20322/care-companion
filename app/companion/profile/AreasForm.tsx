"use client";

import { useState } from "react";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { ActionState } from "@/lib/services/action-helpers";
import type { ProvinceWithDistricts } from "@/lib/services/catalog";
import { saveServiceAreas } from "./actions";

type AreasFormProps = {
  locations: ProvinceWithDistricts[];
  selected: number[];
  /** Listed or under-review companions must keep at least one area. */
  required: boolean;
};

export function AreasForm({ locations, selected, required }: AreasFormProps) {
  const { state, formAction, pending, formRef, handleSubmit } = useActionForm<ActionState>(saveServiceAreas, {});
  const [initial] = useState(() => new Set(selected));
  const [chosen, setChosen] = useState(() => new Set(selected));
  const blocked = required && chosen.size === 0;

  function toggle(id: number, on: boolean) {
    setChosen((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-5">
      {locations.map((province, index) => (
        <details
          key={province.id}
          open={index === 0 || province.districts.some((d) => initial.has(d.id))}
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
                  checked={chosen.has(district.id)}
                  onChange={(event) => toggle(district.id, event.target.checked)}
                  className="size-5 accent-sakura-600"
                />
                <span className="text-sumi">{district.name_th}</span>
              </label>
            ))}
          </fieldset>
        </details>
      ))}
      <p aria-live="polite" className={blocked ? "font-medium text-beni" : "text-sumi-soft"}>
        {blocked
          ? "ต้องเลือกอย่างน้อย 1 เขต เพราะโปรไฟล์ของคุณแสดงให้ผู้ใช้บริการเห็นหรือกำลังรอตรวจสอบ"
          : `เลือกแล้วทั้งหมด ${chosen.size} เขต`}
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending} pendingLabel="กำลังบันทึก..." disabled={blocked}>
          บันทึกพื้นที่ให้บริการ
        </SubmitButton>
        <FormStatus ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
