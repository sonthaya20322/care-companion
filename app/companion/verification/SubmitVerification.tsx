"use client";

import { useActionState } from "react";
import { FormStatus } from "@/components/ui/FormStatus";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";
import { submitVerification } from "./actions";

export function SubmitVerification({ ready }: { ready: boolean }) {
  const [state, formAction] = useActionState<ActionState, FormData>(() => submitVerification(), {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-4">
      <SubmitButton size="lg" disabled={!ready} pendingLabel="กำลังส่ง...">
        ส่งให้ผู้ดูแลระบบตรวจสอบ
      </SubmitButton>
      <FormStatus ok={state.ok} message={state.message} />
    </form>
  );
}
