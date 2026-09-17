import { DISPLAY_NAME } from "@/lib/boot";
import { NOTE_FOLDERS, NOTES } from "@/lib/notes-content";
import type { ProjectRow } from "@/lib/projects";
import { buildProjectsJsonLd, buildSiteJsonLd, CONTACT_EMAIL, SITE_TAGLINE } from "@/lib/seo";

type SeoFallbackContentProps = {
  projects: ProjectRow[];
};

/**
 * Server-rendered content for crawlers and screen readers: the OS shell is
 * entirely client-rendered and most of it only mounts once a window is
 * opened, so without this, the initial HTML has no real content (see TODO.md
 * Phase 9's "fallback SEO" warning and the seo-geo-boost skill, section 1 —
 * most AI crawlers never run the client JS at all).
 *
 * `sr-only`, not `hidden`/`display:none`: this is the same content a sighted
 * user reaches by opening Notes/Finder, not cloaked filler — it stays in the
 * accessibility tree for screen reader users too, not just for bots.
 */
export function SeoFallbackContent({ projects }: SeoFallbackContentProps) {
  const aboutNote = NOTES.find((note) => note.id === "about-me");
  const skillsNote = NOTES.find((note) => note.id === "skills-list");

  return (
    <div className="sr-only">
      <h1>
        {DISPLAY_NAME} : {SITE_TAGLINE}
      </h1>

      {aboutNote ? (
        <section aria-labelledby="seo-about-heading">
          <h2 id="seo-about-heading">
            {NOTE_FOLDERS.find((folder) => folder.id === aboutNote.folderId)?.name}
          </h2>
          {aboutNote.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
      ) : null}

      {skillsNote ? (
        <section aria-labelledby="seo-skills-heading">
          <h2 id="seo-skills-heading">Compétences</h2>
          <ul>
            {skillsNote.body.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {projects.length > 0 ? (
        <section aria-labelledby="seo-projects-heading">
          <h2 id="seo-projects-heading">Projets</h2>
          <ul>
            {projects.map((project) => (
              <li key={project.id}>
                <a href={project.url} target="_blank" rel="noopener noreferrer">
                  {project.name}
                </a>
                {project.description ? <p>{project.description}</p> : null}
                {project.tech.length > 0 ? <p>Technologies : {project.tech.join(", ")}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p>Contact : {CONTACT_EMAIL}</p>

      <script
        type="application/ld+json"
        // JSON-LD only — see buildSiteJsonLd/buildProjectsJsonLd, no user input reaches this
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSiteJsonLd()) }}
      />
      {projects.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProjectsJsonLd(projects)) }}
        />
      ) : null}
    </div>
  );
}
