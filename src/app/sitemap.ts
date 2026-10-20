import type { MetadataRoute } from "next";
import { getVisibleProjectRows } from "@/lib/projects";
import { projectPath, SITE_URL } from "@/lib/seo";

/** Hosts of this domain: Search Console's "Domain" property for elwen.dev proves ownership of all of them, which allows listing them in this sitemap. */
const OWNED_HOST_SUFFIX = ".elwen.dev";

/** Projects added in the admin show up within a day. */
export const revalidate = 86400;

function isOwnedProjectUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith(OWNED_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/**
 * The portfolio itself lives on a single route (the OS shell, see `page.tsx`),
 * and `/admin` is intentionally excluded (see robots.ts). Every visible project
 * has its own page here (`/projets/[slug]`), and those hosted on a
 * `*.elwen.dev` subdomain are listed too, so they are discovered
 * from here; projects on other domains (detailing.fr, vercel.app) can only be
 * declared by their own owner and are left out.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getVisibleProjectRows();
  const projectUrls = [...new Set(projects.map((project) => project.url))]
    .filter(isOwnedProjectUrl)
    .map((url) => ({ url, changeFrequency: "monthly" as const, priority: 0.8 }));
  const projectPages = projects.map((project) => ({
    url: `${SITE_URL}${projectPath(project.slug)}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...projectPages,
    ...projectUrls,
  ];
}
