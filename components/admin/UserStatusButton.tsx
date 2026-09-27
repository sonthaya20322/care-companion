"use client";

import { useActionState } from "react";
import { setUserStatus } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";

type Props = { userId: string; name: string; status: "active" | "suspended" };

export function UserStatusButton({ userId, name, status }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(setUserStatus, {});
  const next = status === "active" ? "suspended" : "active";

  return (
    <form
      action={formAction}
      className="flex flex-col items-end gap-1"
      onSubmit={(event) => {
        if (next === "suspended" && !window.confirm(`ระงับบัญชีของ ${name}? ผู้ใช้จะเข้าใช้งานไม่ได้จนกว่าจะเปิดอีกครั้ง`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="status" value={next} />
      <SubmitButton variant={next === "suspended" ? "danger" : "secondary"} pendingLabel="กำลังบันทึก...">
        {next === "suspended" ? "ระงับบัญชี" : "เปิดใช้งาน"}
      </SubmitButton>
      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-beni">
          {state.message}
        </p>
      )}
    </form>
  );
}
