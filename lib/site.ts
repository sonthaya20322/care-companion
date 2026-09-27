export const site = {
  name: "Care Companion",
  contactEmail: "Sonthaya20322@gmail.com",
  policyEffectiveDate: "27 กันยายน 2569",
} as const;

/** Public base URL used for OAuth redirects; never derived from request headers. */
export function siteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return url.replace(/\/+$/, "");
}
