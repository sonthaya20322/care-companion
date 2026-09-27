"use client";

import { useState, type FormEvent } from "react";
import { bookingAction } from "@/app/bookings/actions";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { BookingAction } from "@/lib/domain/booking";
import type { UserRole } from "@/lib/domain/roles";
import { useActionForm } from "@/lib/hooks/use-action-form";
import type { ActionState } from "@/lib/services/action-helpers";
import { cn } from "@/lib/utils/cn";

type Props = {
  bookingId: string;
  actions: BookingAction[];
  viewerRole: UserRole;
  /** Companion cancelling close to the start: ask for a second confirmation. */
  lateCancel?: boolean;
};

export function BookingActions({ bookingId, actions, viewerRole, lateCancel = false }: Props) {
  // Forms with typed text submit through handleSubmit so a rejected submit keeps the text.
  const { state, formAction, pending, handleSubmit } = useActionForm<ActionState>(bookingAction, {});
  const [toggled, setOpen] = useState<"cancel" | "reject" | null>(null);
  const open = toggled && actions.includes(toggled) ? toggled : null;

  if (actions.length === 0 && !state.message) return null;

  const hidden = (action: BookingAction) => (
    <>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="action" value={action} />
    </>
  );
  const reasonRequired = viewerRole !== "customer";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {actions.includes("claim") && (
          <form action={formAction}>
            {hidden("claim")}
            <SubmitButton size="lg" pendingLabel="กำลังรับงาน...">
              รับงานนี้
            </SubmitButton>
          </form>
        )}
        {actions.includes("accept") && (
          <form action={formAction}>
            {hidden("accept")}
            <SubmitButton size="lg" pendingLabel="กำลังตอบรับ...">
              ตอบรับงาน
            </SubmitButton>
          </form>
        )}
        {actions.includes("start") && (
          <form action={formAction}>
            {hidden("start")}
            <SubmitButton size="lg" pendingLabel="กำลังบันทึก...">
              เริ่มงาน (พบผู้ใช้บริการแล้ว)
            </SubmitButton>
          </form>
        )}
        {actions.includes("complete") && (
          <form action={formAction}>
            {hidden("complete")}
            <SubmitButton size="lg" pendingLabel="กำลังบันทึก...">
              จบงาน
            </SubmitButton>
          </form>
        )}
        {actions.includes("confirm_complete") && (
          <form action={formAction}>
            {hidden("confirm_complete")}
            <SubmitButton size="lg" pendingLabel="กำลังบันทึก...">
              ยืนยันว่าจบงานแล้ว
            </SubmitButton>
          </form>
        )}
        {actions.includes("reopen") && (
          <form action={formAction}>
            {hidden("reopen")}
            <SubmitButton size="lg" pendingLabel="กำลังเปิดคำขอ...">
              เปิดเป็นคำขอให้ผู้ช่วยคนอื่น
            </SubmitButton>
          </form>
        )}
        {actions.includes("no_show") && (
          <form
            action={formAction}
            onSubmit={(event) => {
              if (!window.confirm("ยืนยันว่าผู้ช่วยไม่มาตามนัด? นัดนี้จะถูกปิดและผู้ดูแลระบบจะเห็นรายการนี้")) {
                event.preventDefault();
              }
            }}
          >
            {hidden("no_show")}
            <SubmitButton variant="danger" size="lg" pendingLabel="กำลังบันทึก...">
              ผู้ช่วยไม่มาตามนัด
            </SubmitButton>
          </form>
        )}
        {actions.includes("reject") && (
          <Button variant="secondary" size="lg" onClick={() => setOpen(open === "reject" ? null : "reject")} aria-expanded={open === "reject"}>
            ปฏิเสธ
          </Button>
        )}
        {actions.includes("cancel") && (
          <Button variant="danger" size="lg" onClick={() => setOpen(open === "cancel" ? null : "cancel")} aria-expanded={open === "cancel"}>
            ยกเลิกนัดหมาย
          </Button>
        )}
      </div>

      {open && (
        <form
          action={formAction}
          onSubmit={handleSubmit}
          className={cn("animate-rise flex flex-col gap-4 rounded-card p-5", open === "cancel" ? "bg-beni-bg" : "bg-washi")}
        >
          {hidden(open)}
          <Field
            id={`${open}-note`}
            label={open === "cancel" ? "เหตุผลที่ยกเลิก" : "เหตุผลที่ปฏิเสธ (ถ้ามี)"}
            hint={open === "cancel" && !reasonRequired ? "ไม่บังคับ แต่ช่วยให้ผู้ช่วยเข้าใจ" : undefined}
            required={open === "cancel" && reasonRequired}
          >
            <Textarea id={`${open}-note`} name="note" rows={2} maxLength={500} required={open === "cancel" && reasonRequired} />
          </Field>
          {open === "cancel" && lateCancel && (
            <div className="flex flex-col gap-2 rounded-control bg-washi-surface p-4 ring-1 ring-beni/30">
              <p className="font-medium text-beni">
                เหลือเวลาไม่ถึง 2 ชั่วโมงก่อนนัด ผู้ใช้บริการอาจหาผู้ช่วยคนใหม่ไม่ทัน
                การยกเลิกกระชั้นชิดจะถูกบันทึกและผู้ดูแลระบบจะเห็นจำนวนครั้ง
              </p>
              <label className="flex items-start gap-3 text-sumi">
                <input type="checkbox" name="confirmLate" required className="mt-1 size-5 accent-beni" />
                ฉันเข้าใจและยืนยันว่าจำเป็นต้องยกเลิกนัดนี้จริง
              </label>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <SubmitButton pending={pending} variant={open === "cancel" ? "danger" : "secondary"} pendingLabel="กำลังบันทึก...">
              {open === "cancel" ? "ยืนยันการยกเลิก" : "ยืนยันการปฏิเสธ"}
            </SubmitButton>
            <Button variant="ghost" onClick={() => setOpen(null)}>
              ไม่ใช่ตอนนี้
            </Button>
          </div>
        </form>
      )}

      {actions.includes("review") && (
        <ReviewForm bookingId={bookingId} formAction={formAction} onSubmit={handleSubmit} pending={pending} />
      )}

      <FormStatus ok={state.ok} message={state.message} />
    </div>
  );
}

type ReviewFormProps = {
  bookingId: string;
  formAction: (formData: FormData) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pending: boolean;
};

function ReviewForm({ bookingId, formAction, onSubmit, pending }: ReviewFormProps) {
  return (
    <form action={formAction} onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card bg-sakura-50 p-5">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="action" value="review" />
      <fieldset>
        <legend className="font-display text-lg text-sumi">ให้คะแนนผู้ช่วย</legend>
        <div className="mt-2 flex flex-row-reverse justify-end gap-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <label
              key={star}
              className="cursor-pointer rounded-control text-washi-line transition-colors hover:text-yamabuki has-[:checked]:text-yamabuki has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sora-600 [label:has(:checked)~&]:text-yamabuki [label:hover~&]:text-yamabuki"
            >
              <input type="radio" name="rating" value={star} className="sr-only" required />
              <span className="sr-only">{star} ดาว</span>
              <svg viewBox="0 0 24 24" aria-hidden className="size-10">
                <path fill="currentColor" d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
              </svg>
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="review-comment" label="ความประทับใจ (ถ้ามี)">
        <Textarea id="review-comment" name="comment" rows={3} maxLength={1000} />
      </Field>
      <SubmitButton pending={pending} className="self-start" pendingLabel="กำลังส่ง...">
        ส่งรีวิว
      </SubmitButton>
    </form>
  );
}
