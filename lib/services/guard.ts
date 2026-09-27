import { redirect } from "next/navigation";
import { homePathFor, type UserRole } from "@/lib/domain/roles";
import { getCurrentProfile, type Profile } from "./session";

export type RoleProfile<R extends UserRole> = Profile & { role: R };

/**
 * Server-side gate for role areas. Redirects signed-out users to login,
 * users without a role to onboarding, suspended users to /suspended and
 * everyone else to their own area. RLS still protects the data itself.
 */
export async function requireRole<R extends UserRole>(role: R, from: string): Promise<RoleProfile<R>> {
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(from)}`);
  if (profile.status === "suspended") redirect("/suspended");
  if (profile.role !== role) redirect(homePathFor(profile.role));
  return profile as RoleProfile<R>;
}
