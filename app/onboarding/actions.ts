"use server";

import { redirect } from "next/navigation";
import { errorMessages, toUserMessage } from "@/lib/domain/errors";
import { fieldErrorCodes, onboardingSchema } from "@/lib/domain/profile";
import { homePathFor } from "@/lib/domain/roles";
import { getCurrentUserId } from "@/lib/services/session";
import { createClient } from "@/lib/supabase/server";

export type OnboardingState = {
  message?: string;
  fieldErrors?: Partial<Record<"role" | "fullName" | "phone", string>>;
  values?: { role?: string; fullName?: string; phone?: string };
};

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const values = {
    role: formData.get("role")?.toString(),
    fullName: formData.get("fullName")?.toString() ?? "",
    phone: formData.get("phone")?.toString() ?? "",
  };

  if (!(await getCurrentUserId())) redirect("/login?next=/onboarding");

  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    const codes = fieldErrorCodes<"role" | "fullName" | "phone">(parsed.error);
    const fieldErrors = Object.fromEntries(
      Object.entries(codes).map(([key, code]) => [key, errorMessages[code as string] ?? code]),
    );
    return { fieldErrors, values };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_onboarding", {
    p_role: parsed.data.role,
    p_full_name: parsed.data.fullName,
    p_phone: parsed.data.phone,
  });

  if (error) {
    if (error.message.includes("ALREADY_ONBOARDED")) redirect("/");
    console.error("complete_onboarding failed", { code: error.code });
    return { message: toUserMessage(error), values };
  }

  redirect(homePathFor(parsed.data.role));
}
