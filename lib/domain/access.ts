import { requiredRoleForPath } from "./roles";

/** Paths that need a signed-in user (any role, or none yet for onboarding). */
export function requiresAuth(pathname: string): boolean {
  if (pathname === "/onboarding" || pathname.startsWith("/onboarding/")) return true;
  return requiredRoleForPath(pathname) !== null;
}

/**
 * Accepts only same-origin relative paths for post-login redirects,
 * so `?next=` cannot send users to another site.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  if (/[\u0000-\u001f]/.test(next)) return fallback;
  return next;
}
