import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/domain/access";
import { homePathFor, type UserRole } from "@/lib/domain/roles";
import { siteUrl } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"), "");
  const base = siteUrl();

  if (!code) {
    return NextResponse.redirect(`${base}/login?error=callback`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    console.error("exchangeCodeForSession failed", { code: error?.code });
    return NextResponse.redirect(`${base}/login?error=callback`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  const role = (profile?.role ?? null) as UserRole | null;

  // Users without a role must finish onboarding before going anywhere else.
  const destination = role && next ? next : homePathFor(role);
  return NextResponse.redirect(`${base}${destination}`);
}
