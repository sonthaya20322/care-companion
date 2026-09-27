import type { z } from "zod";
import { errorMessages, fallbackErrorMessage } from "@/lib/domain/errors";
import type { UserRole } from "@/lib/domain/roles";
import { getCurrentProfile, type Profile } from "./session";

export type ActionState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const notAllowed: ActionState = { message: "เซสชันหมดอายุหรือไม่มีสิทธิ์ กรุณาเข้าสู่ระบบใหม่" };

/**
 * Server Functions are reachable by direct POST, so every action re-checks the caller.
 * Returns null when the caller is signed out, suspended or has another role.
 */
export async function actionProfile(role: UserRole): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || profile.status !== "active" || profile.role !== role) return null;
  return profile;
}

/** Zod issues -> Thai message per field (first issue wins). */
export function fieldMessages(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".") || "form";
    result[key] ??= errorMessages[issue.message] ?? fallbackErrorMessage;
  }
  return result;
}
