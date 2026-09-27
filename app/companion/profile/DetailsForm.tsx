"use client";

import { Field, Input, Textarea, describedBy } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { companionRules } from "@/lib/domain/companion";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { ActionState } from "@/lib/services/action-helpers";
import type { MyCompanionProfile } from "@/lib/services/companion-self";
import { saveCompanionDetails } from "./actions";

export function DetailsForm({ profile }: { profile: MyCompanionProfile }) {
  const { state, formAction, pending, formRef, handleSubmit } = useActionForm<ActionState>(saveCompanionDetails, {});
  const errors = state.fieldErrors ?? {};
  const bioHint = `อย่างน้อย ${companionRules.minBioLength} ตัวอักษร เล่าประสบการณ์ ความถนัด และนิสัยการทำงาน`;

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <Field id="bio" label="แนะนำตัว" hint={bioHint} required error={errors.bio}>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          maxLength={companionRules.maxBioLength}
          defaultValue={profile.bio}
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={describedBy("bio", { hint: bioHint, error: errors.bio })}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="experienceYears" label="ประสบการณ์ (ปี)" required error={errors.experienceYears}>
          <Input
            id="experienceYears"
            name="experienceYears"
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            step={1}
            defaultValue={profile.experience_years}
            aria-invalid={Boolean(errors.experienceYears)}
            aria-describedby={describedBy("experienceYears", { error: errors.experienceYears })}
          />
        </Field>
        <Field id="hourlyRate" label="อัตราค่าบริการ (บาท/ชั่วโมง)" required error={errors.hourlyRate}>
          <Input
            id="hourlyRate"
            name="hourlyRate"
            type="number"
            inputMode="numeric"
            min={companionRules.minRate}
            max={companionRules.maxRate}
            step={10}
            defaultValue={profile.hourly_rate}
            aria-invalid={Boolean(errors.hourlyRate)}
            aria-describedby={describedBy("hourlyRate", { error: errors.hourlyRate })}
          />
        </Field>
      </div>

      <Field id="skills" label="ความถนัด" hint="คั่นด้วยเครื่องหมายจุลภาค เช่น เข็นรถเข็น, ติดต่อเวชระเบียน" error={errors.skills}>
        <Input
          id="skills"
          name="skills"
          defaultValue={profile.skills.join(", ")}
          aria-invalid={Boolean(errors.skills)}
          aria-describedby={describedBy("skills", { hint: "คั่นด้วยจุลภาค", error: errors.skills })}
        />
      </Field>

      <Field id="languages" label="ภาษาที่สื่อสารได้" hint="คั่นด้วยเครื่องหมายจุลภาค" required error={errors.languages}>
        <Input
          id="languages"
          name="languages"
          defaultValue={profile.languages.join(", ")}
          aria-invalid={Boolean(errors.languages)}
          aria-describedby={describedBy("languages", { hint: "คั่นด้วยจุลภาค", error: errors.languages })}
        />
      </Field>

      <label className="flex min-h-12 cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          name="hasVehicle"
          defaultChecked={profile.has_vehicle}
          className="size-5 accent-sakura-600"
        />
        <span className="text-sumi">มีรถยนต์ส่วนตัว รับ-ส่งผู้ใช้บริการได้</span>
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton pending={pending} pendingLabel="กำลังบันทึก...">
          บันทึกข้อมูลผู้ช่วย
        </SubmitButton>
        <FormStatus ok={state.ok} message={state.message} />
      </div>
    </form>
  );
}
