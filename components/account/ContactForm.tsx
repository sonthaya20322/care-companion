"use client";

import { useActionState } from "react";
import { updateContact } from "@/app/account/actions";
import { Field, Input, describedBy } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";

export function ContactForm({ fullName, phone, email }: { fullName: string; phone: string | null; email: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateContact, {});
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <Field id="email" label="อีเมล (จาก Google)" hint="เปลี่ยนไม่ได้">
        <Input id="email" value={email} disabled readOnly aria-describedby="email-hint" />
      </Field>
      <Field id="fullName" label="ชื่อ-นามสกุล" required error={errors.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={fullName}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={describedBy("fullName", { error: errors.fullName })}
          required
        />
      </Field>
      <Field id="phone" label="เบอร์โทรศัพท์" required error={errors.phone}>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={phone ?? ""}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("phone", { error: errors.phone })}
          required
        />
      </Field>
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pendingLabel="กำลังบันทึก...">บันทึกข้อมูลติดต่อ</SubmitButton>
        <FormStatus ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
