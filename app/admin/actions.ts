"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { errandTypeSchema, reviewDecisionSchema, userStatusSchema } from "@/lib/domain/admin";
import { errorMessages, toUserMessage } from "@/lib/domain/errors";
import { actionProfile, fieldMessages, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { createClient } from "@/lib/supabase/server";

export async function reviewCompanion(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await actionProfile("admin"))) return notAllowed;
  const parsed = reviewDecisionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldMessages(parsed.error) };
  const { companionId, decision, note } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_review_companion", {
    p_companion_id: companionId,
    p_approve: decision === "approve",
    p_note: note || undefined,
  });
  if (error) {
    console.error("admin_review_companion failed", { code: error.code });
    return { message: toUserMessage(error) };
  }
  redirect(`/admin/verifications?done=${decision}`);
}

export async function setUserStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await actionProfile("admin"))) return notAllowed;
  const parsed = userStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: errorMessages.USER_NOT_FOUND };

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_user_status", {
    p_user_id: parsed.data.userId,
    p_status: parsed.data.status,
  });
  if (error) {
    console.error("admin_set_user_status failed", { code: error.code });
    return { message: toUserMessage(error) };
  }
  refresh();
  return {
    ok: true,
    message: parsed.data.status === "suspended" ? "ระงับบัญชีและยกเลิกนัดที่ยังไม่เริ่มแล้ว" : "เปิดใช้งานบัญชีแล้ว",
  };
}

export async function saveErrandType(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await actionProfile("admin"))) return notAllowed;
  const parsed = errandTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldMessages(parsed.error) };
  const { id, ...values } = parsed.data;

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("errand_types").update(values).eq("id", id)
    : await supabase.from("errand_types").insert(values);
  if (error) {
    console.error("save errand type failed", { code: error.code });
    if (error.code === "23505") return { fieldErrors: { slug: errorMessages.SLUG_TAKEN } };
    return { message: toUserMessage(error) };
  }
  refresh();
  return { ok: true, message: id ? "บันทึกการแก้ไขแล้ว" : "เพิ่มประเภทธุระแล้ว" };
}
