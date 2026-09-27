"use client";

import { useActionState } from "react";
import { reviewCompanion } from "@/app/admin/actions";
import { Field, Textarea, describedBy } from "@/components/ui/Field";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";

export function ReviewCompanionForm({ companionId }: { companionId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(reviewCompanion, {});
  const noteError = state.fieldErrors?.note;
  const hint = "จำเป็นเมื่อไม่อนุมัติ ผู้ช่วยจะเห็นข้อความนี้เพื่อแก้ไขแล้วส่งใหม่";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="companionId" value={companionId} />
      <Field id="review-note" label="หมายเหตุถึงผู้ช่วย" hint={hint} error={noteError}>
        <Textarea
          id="review-note"
          name="note"
          rows={3}
          maxLength={500}
          aria-invalid={noteError ? true : undefined}
          aria-describedby={describedBy("review-note", { hint, error: noteError })}
        />
      </Field>
      <div className="flex flex-wrap gap-3">
        <SubmitButton name="decision" value="approve" size="lg" pendingLabel="กำลังบันทึก...">
          อนุมัติ
        </SubmitButton>
        <SubmitButton name="decision" value="reject" variant="danger" size="lg" pendingLabel="กำลังบันทึก...">
          ไม่อนุมัติ
        </SubmitButton>
      </div>
      <FormStatus ok={state.ok} message={state.message} />
    </form>
  );
}
