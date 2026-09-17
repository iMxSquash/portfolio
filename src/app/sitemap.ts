import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * The whole portfolio lives on a single route (the OS shell, see `page.tsx`)
 * — projects open as windows/iframes rather than their own pages, so there
 * is only one entry here. `/admin` is intentionally excluded (see robots.ts).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
