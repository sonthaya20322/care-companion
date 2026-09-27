import { cache } from "react";
import type { AccountStatus, UserRole } from "@/lib/domain/roles";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  role: UserRole | null;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  status: AccountStatus;
};

/** The signed-in user's id, verified from the JWT. Deduplicated per request. */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  return data.claims.sub;
});

/** The signed-in user's profile row, or null when signed out. Deduplicated per request. */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, email, full_name, phone, avatar_url, status")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile failed", { code: error.code });
    throw new Error("PROFILE_LOAD_FAILED", { cause: error });
  }
  return data as Profile | null;
});
