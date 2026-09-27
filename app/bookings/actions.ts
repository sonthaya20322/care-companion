"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { actionSuccessMessages, bookingActionSchema } from "@/lib/domain/booking-action";
import { toUserMessage } from "@/lib/domain/errors";
import { fieldMessages, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { getCurrentProfile } from "@/lib/services/session";
import { createClient } from "@/lib/supabase/server";

const allowedRoles = {
  accept: ["companion"],
  reject: ["companion"],
  claim: ["companion"],
  start: ["companion"],
  complete: ["companion"],
  cancel: ["customer", "companion", "admin"],
  review: ["customer"],
  no_show: ["customer"],
  confirm_complete: ["customer"],
  reopen: ["customer"],
} as const;

export async function bookingAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = bookingActionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: Object.values(fieldMessages(parsed.error))[0] };
  const input = parsed.data;

  const profile = await getCurrentProfile();
  if (
    !profile ||
    profile.status !== "active" ||
    !profile.role ||
    !(allowedRoles[input.action] as readonly string[]).includes(profile.role)
  ) {
    return notAllowed;
  }

  const supabase = await createClient();

  if (input.action === "reopen") {
    const { data, error } = await supabase.rpc("reopen_booking", { p_booking_id: input.bookingId });
    if (error) {
      console.error("booking action failed", { action: input.action, code: error.code });
      return { message: toUserMessage(error) };
    }
    redirect(`/customer/bookings/${data as string}?created=1`);
  }

  const { error } = await (() => {
    switch (input.action) {
      case "accept":
        return supabase.rpc("respond_booking", { p_booking_id: input.bookingId, p_accept: true });
      case "reject":
        return supabase.rpc("respond_booking", {
          p_booking_id: input.bookingId,
          p_accept: false,
          p_note: input.note || undefined,
        });
      case "claim":
        return supabase.rpc("claim_open_booking", { p_booking_id: input.bookingId });
      case "start":
        return supabase.rpc("start_booking", { p_booking_id: input.bookingId });
      case "complete":
        return supabase.rpc("complete_booking", { p_booking_id: input.bookingId });
      case "cancel":
        return supabase.rpc("cancel_booking", { p_booking_id: input.bookingId, p_reason: input.note || undefined });
      case "no_show":
        return supabase.rpc("report_no_show", { p_booking_id: input.bookingId });
      case "confirm_complete":
        return supabase.rpc("confirm_completion", { p_booking_id: input.bookingId });
      case "review":
        return supabase.rpc("submit_review", {
          p_booking_id: input.bookingId,
          p_rating: input.rating,
          p_comment: input.comment || undefined,
        });
    }
  })();

  if (error) {
    console.error("booking action failed", { action: input.action, code: error.code });
    return { message: toUserMessage(error, profile.role === "companion" ? "companion" : undefined) };
  }

  if (input.action === "claim" || input.action === "accept") {
    redirect(`/companion/jobs/${input.bookingId}?accepted=1`);
  }
  refresh();
  return { ok: true, message: actionSuccessMessages[input.action] };
}
