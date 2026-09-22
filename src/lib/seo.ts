import { DISPLAY_NAME } from "@/lib/boot";
import type { ProjectRow } from "@/lib/projects";

/** Canonical production origin — see the domain/DNS decisions in TODO.md Phase 0/8. */
export const SITE_URL = "https://elwen.dev";

export const SITE_NAME = "Elwen Portfolio";
/** Short — combined with `DISPLAY_NAME` for `<title>` (50-60 char SEO budget, see seo-geo-boost skill), separately for `og:description`'s lead-in. */
export const SITE_TAGLINE = "Développeur full-stack";
export const SITE_DESCRIPTION =
  "Portfolio d'Elwen, développeur full-stack, qui reproduit fidèlement macOS sur ordinateur et iOS sur mobile. Projets, parcours et compétences, présentés dans un vrai bureau et un vrai springboard.";
/** Public contact address — the portfolio's own mailbox, not a personal one. Single source of truth, reused by the JSON-LD, the SEO fallback content and `llms.txt`. */
export const CONTACT_EMAIL = "contact@elwen.dev";

/** Elwen's other profiles — labeled so Notes.app's "Contact" note can list them by name; feeds the `Person` JSON-LD's `sameAs` (bare URLs only) so search/AI engines can cross-reference the same entity across sites (see seo-geo-boost skill). */
export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/iMxSquash" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/elwen-coussot/" },
];

/** `Person` (site owner) + `WebSite` JSON-LD — present on every page, see the seo-geo-boost skill. */
export function buildSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: DISPLAY_NAME,
        url: SITE_URL,
        jobTitle: "Développeur full-stack",
        email: `mailto:${CONTACT_EMAIL}`,
        sameAs: SOCIAL_LINKS.map((link) => link.href),
        address: {
          "@type": "PostalAddress",
          addressLocality: "Herblay",
          addressRegion: "Île-de-France",
          addressCountry: "FR",
        },
        alumniOf: {
          "@type": "EducationalOrganization",
          name: "Digital Campus Paris",
        },
        worksFor: {
          "@type": "Organization",
          name: "SP Formation",
        },
        knowsAbout: [
          "React",
          "Next.js",
          "TypeScript",
          "Tailwind CSS",
          "Node.js",
          "Supabase",
          "Python",
          "PHP",
          "React Native",
          "Docker",
          "LangChain",
          "Home Assistant",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "fr-FR",
        author: { "@id": `${SITE_URL}/#person` },
      },
    ],
  };
}

/**
 * Serialize a value to a JSON string safe for embedding in a `<script>` tag.
 * Escapes `<`, `>`, and `&` as unicode escapes so that sequences like
 * `</script>` inside data values cannot break out of the JSON-LD block.
 */
export function safeJsonLdStringify(value: unknown): string {
  return JSON.stringify(value).replace(/[<>&]/g, (ch) => {
    const code = ch.charCodeAt(0).toString(16);
    return `\\u${code.padStart(4, "0")}`;
  });
}

/** One `CreativeWork` per visible project, for the ItemList JSON-LD rendered alongside the fallback content (see SeoFallbackContent). */
export function buildProjectsJsonLd(projects: ProjectRow[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.name,
        description: project.description ?? undefined,
        url: project.url,
        keywords: project.tech.length > 0 ? project.tech.join(", ") : undefined,
        image: project.logo_url,
      },
    })),
  };
}
