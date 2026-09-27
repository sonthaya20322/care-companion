"use client";

import { useActionState } from "react";
import { Field, Input, describedBy } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { cn } from "@/lib/utils/cn";
import { completeOnboarding, type OnboardingState } from "./actions";

const roleOptions = [
  {
    value: "customer",
    title: "ผู้ใช้บริการ",
    body: "หาผู้ช่วยพาไปหาหมอ ธนาคาร หรือทำธุระนอกบ้าน ให้ตัวเองหรือคนในครอบครัว",
  },
  {
    value: "companion",
    title: "ผู้ช่วยร่วมเดินทาง",
    body: "รับงานพาผู้อื่นไปทำธุระในพื้นที่และเวลาที่สะดวก ต้องยืนยันตัวตนก่อนรับงาน",
  },
] as const;

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [state, formAction] = useActionState<OnboardingState, FormData>(completeOnboarding, {});
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      {state.message && (
        <p role="alert" className="rounded-control bg-beni-bg px-4 py-3 font-medium text-beni">
          {state.message}
        </p>
      )}

      <fieldset aria-describedby={errors.role ? "role-error" : undefined}>
        <legend className="font-medium text-sumi">
          คุณต้องการใช้งานในฐานะ<span className="ml-1 text-beni" aria-hidden>*</span>
        </legend>
        <p className="mt-1 text-sm text-sumi-soft">เลือกได้ครั้งเดียว หนึ่งบัญชี Google ใช้ได้หนึ่งประเภท</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "relative flex cursor-pointer flex-col gap-1 rounded-card bg-washi-surface p-5 ring-1 ring-washi-line",
                "transition-[box-shadow,background-color] duration-200 hover:ring-sakura-200",
                "has-[:checked]:bg-sakura-50 has-[:checked]:ring-2 has-[:checked]:ring-sakura-600",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sora-600",
              )}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                defaultChecked={values.role === option.value}
                className="peer sr-only"
                required
              />
              <span className="font-display text-lg text-sumi">{option.title}</span>
              <span className="text-sumi-soft">{option.body}</span>
              <span
                aria-hidden
                className="absolute right-4 top-4 hidden size-6 items-center justify-center rounded-full bg-sakura-600 text-white peer-checked:flex"
              >
                <svg viewBox="0 0 24 24" className="size-4">
                  <path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </label>
          ))}
        </div>
        {errors.role && (
          <p id="role-error" role="alert" className="mt-2 text-sm font-medium text-beni">
            {errors.role}
          </p>
        )}
      </fieldset>

      <Field id="fullName" label="ชื่อ-นามสกุล" required error={errors.fullName}>
        <Input
          id="fullName"
          name="fullName"
          autoComplete="name"
          defaultValue={values.fullName ?? defaultName}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={describedBy("fullName", { error: errors.fullName })}
          required
        />
      </Field>

      <Field
        id="phone"
        label="เบอร์โทรศัพท์"
        hint="ใช้ติดต่อเรื่องนัดหมายเท่านั้น จะแสดงให้อีกฝ่ายเห็นหลังตอบรับงานแล้ว"
        required
        error={errors.phone}
      >
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="เช่น 081-234-5678"
          defaultValue={values.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={describedBy("phone", {
            hint: "ใช้ติดต่อเรื่องนัดหมายเท่านั้น",
            error: errors.phone,
          })}
          required
        />
      </Field>

      <SubmitButton size="lg" pendingLabel="กำลังบันทึก...">
        เริ่มใช้งาน
      </SubmitButton>
    </form>
  );
}
