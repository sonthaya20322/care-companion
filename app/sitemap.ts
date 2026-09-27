import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const publicPaths = ["", "/companions", "/how-it-works", "/become-companion", "/login", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return publicPaths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "/companions" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
