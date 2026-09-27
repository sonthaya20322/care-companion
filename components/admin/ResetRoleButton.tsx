"use client";

import { useActionState } from "react";
import { resetUserRole } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ActionState } from "@/lib/services/action-helpers";

type Props = { userId: string; name: string; roleLabel: string };

export function ResetRoleButton({ userId, name, roleLabel }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(resetUserRole, {});

  return (
    <form
      action={formAction}
      className="flex flex-col items-end gap-1"
      onSubmit={(event) => {
        if (
          !window.confirm(
            `รีเซ็ตประเภทบัญชีของ ${name} (ตอนนี้เป็น${roleLabel})? ผู้ใช้จะต้องเลือกประเภทบัญชีใหม่ และข้อมูลโปรไฟล์ผู้ช่วย (ถ้ามี) จะถูกลบ`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <SubmitButton variant="ghost" pendingLabel="กำลังรีเซ็ต...">
        รีเซ็ตประเภทบัญชี
      </SubmitButton>
      {state.message && !state.ok && (
        <p role="alert" className="text-sm text-beni">
          {state.message}
        </p>
      )}
    </form>
  );
}
