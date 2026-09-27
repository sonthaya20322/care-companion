import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/customer", "/companion$", "/companion/", "/admin", "/account", "/onboarding", "/auth", "/suspended"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
