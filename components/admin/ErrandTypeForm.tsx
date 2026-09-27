"use client";

import { useActionState } from "react";
import { saveErrandType } from "@/app/admin/actions";
import { Field, Input, describedBy } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";
import type { ErrandType } from "@/lib/services/catalog";

export function ErrandTypeForm({ errand, nextSortOrder = 0 }: { errand?: ErrandType; nextSortOrder?: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveErrandType, {});
  const errors = state.fieldErrors ?? {};
  const prefix = errand ? `errand-${errand.id}` : "errand-new";
  const field = (name: string) => ({
    id: `${prefix}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": describedBy(`${prefix}-${name}`, { error: errors[name] }),
  });

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {errand && <input type="hidden" name="id" value={errand.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem_7rem]">
        <Field id={`${prefix}-name_th`} label="ชื่อที่แสดง" error={errors.name_th} required>
          <Input {...field("name_th")} defaultValue={errand?.name_th} required maxLength={60} />
        </Field>
        <Field id={`${prefix}-slug`} label="รหัส (อังกฤษ)" error={errors.slug} required>
          <Input {...field("slug")} defaultValue={errand?.slug} required maxLength={40} pattern="[a-zA-Z0-9\-]+" />
        </Field>
        <Field id={`${prefix}-sort_order`} label="ลำดับ" error={errors.sort_order}>
          <Input
            {...field("sort_order")}
            type="number"
            min={0}
            max={999}
            defaultValue={errand?.sort_order ?? nextSortOrder}
            inputMode="numeric"
          />
        </Field>
      </div>
      <Field id={`${prefix}-description`} label="คำอธิบายสั้นๆ" error={errors.description}>
        <Input {...field("description")} defaultValue={errand?.description} maxLength={300} />
      </Field>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sumi">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={errand?.is_active ?? true}
            className="size-5 accent-sakura-600"
          />
          เปิดให้ลูกค้าเลือก
        </label>
        <SubmitButton pendingLabel="กำลังบันทึก...">{errand ? "บันทึก" : "เพิ่มประเภทธุระ"}</SubmitButton>
      </div>
      <FormStatus ok={state.ok} message={state.message} />
    </form>
  );
}
