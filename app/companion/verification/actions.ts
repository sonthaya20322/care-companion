"use server";

import { refresh } from "next/cache";
import { toUserMessage } from "@/lib/domain/errors";
import { actionProfile, notAllowed, type ActionState } from "@/lib/services/action-helpers";
import { getMyCompanionProfile } from "@/lib/services/companion-self";
import { createClient } from "@/lib/supabase/server";

const documentPath = /^[0-9a-f-]{36}\/id-\d+\.(jpg|png|webp|pdf)$/;

/** Records the file the browser just uploaded to companion-documents/<uid>/. */
export async function setIdentityDocument(path: string): Promise<ActionState> {
  const profile = await actionProfile("companion");
  if (!profile) return notAllowed;
  if (!documentPath.test(path) || !path.startsWith(`${profile.id}/`)) return { message: "ไฟล์เอกสารไม่ถูกต้อง" };

  const companion = await getMyCompanionProfile(profile.id);
  if (!companion || !["draft", "rejected"].includes(companion.verification_status)) {
    return { message: "เปลี่ยนเอกสารได้เฉพาะก่อนส่งตรวจสอบ หรือหลังไม่ผ่านการตรวจสอบ" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("companion_profiles").update({ id_document_path: path }).eq("id", profile.id);
  if (error) {
    console.error("setIdentityDocument failed", { code: error.code });
    return { message: toUserMessage(error) };
  }

  const previous = companion.id_document_path;
  if (previous && previous !== path) {
    const { error: removeError } = await supabase.storage.from("companion-documents").remove([previous]);
    if (removeError) console.error("remove old document failed", { message: removeError.message });
  }

  refresh();
  return { ok: true, message: "อัปโหลดเอกสารแล้ว" };
}

export async function submitVerification(): Promise<ActionState> {
  const profile = await actionProfile("companion");
  if (!profile) return notAllowed;

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_companion_verification");
  if (error) {
    console.error("submit_companion_verification failed", { code: error.code });
    return { message: toUserMessage(error) };
  }

  refresh();
  return { ok: true, message: "ส่งตรวจสอบแล้ว ผู้ดูแลระบบจะตรวจสอบโดยเร็ว" };
}
