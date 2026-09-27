"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/domain/access";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function signInWithGoogle(formData: FormData) {
  const next = safeNextPath(formData.get("next")?.toString(), "");
  const callback = new URL("/auth/callback", siteUrl());
  if (next) callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString() },
  });

  if (error || !data.url) {
    console.error("signInWithOAuth failed", { code: error?.code });
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) console.error("signOut failed", { code: error.code });
  redirect("/");
}
