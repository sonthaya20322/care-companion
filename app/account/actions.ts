"use server";

import { refresh } from "next/cache";
import { toUserMessage } from "@/lib/domain/errors";
import { contactSchema } from "@/lib/domain/profile";
import { fieldMessages, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { getCurrentProfile } from "@/lib/services/session";
import { createClient } from "@/lib/supabase/server";

async function activeProfile() {
  const profile = await getCurrentProfile();
  return profile && profile.status === "active" && profile.role ? profile : null;
}

export async function updateContact(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const profile = await activeProfile();
  if (!profile) return notAllowed;

  const parsed = contactSchema.safeParse({
    fullName: formData.get("fullName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
  });
  if (!parsed.success) return { fieldErrors: fieldMessages(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.fullName, phone: parsed.data.phone })
    .eq("id", profile.id);
  if (error) {
    console.error("updateContact failed", { code: error.code });
    return { message: toUserMessage(error) };
  }

  refresh();
  return { ok: true, message: "บันทึกข้อมูลติดต่อแล้ว" };
}

/** Called after the browser uploaded the file to avatars/<uid>/...; the URL is rebuilt here, never trusted from the client. */
export async function setAvatar(path: string): Promise<ActionState> {
  const profile = await activeProfile();
  if (!profile) return notAllowed;
  if (!/^[0-9a-f-]{36}\/avatar-\d+\.(jpg|png|webp)$/.test(path) || !path.startsWith(`${profile.id}/`)) {
    return { message: "ไฟล์รูปไม่ถูกต้อง" };
  }

  const supabase = await createClient();
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const { error } = await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
  if (error) {
    console.error("setAvatar failed", { code: error.code });
    return { message: toUserMessage(error) };
  }

  refresh();
  return { ok: true, message: "เปลี่ยนรูปโปรไฟล์แล้ว" };
}
