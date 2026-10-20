import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DISPLAY_NAME } from "@/lib/boot";
import { getVisibleProjectBySlug, getVisibleProjectRows } from "@/lib/projects";
import { buildProjectPageJsonLd, projectPath, safeJsonLdStringify } from "@/lib/seo";

// Projects are edited in the admin: refresh hourly, unknown slugs render on demand.
export const revalidate = 3600;

// Search engines cut meta descriptions around 155-160 characters.
const DESCRIPTION_MAX = 155;
const LOGO_SIZE = 72;
const LINK_CLASS =
  "font-medium text-[var(--system-blue)] underline-offset-4 hover:underline focus-visible:underline";

export async function generateStaticParams() {
  const projects = await getVisibleProjectRows();
  return projects.map((project) => ({ slug: project.slug }));
}

function describeProject(project: { name: string; description: string | null }): string {
  const text =
    project.description ?? `${project.name}, un projet web développé par ${DISPLAY_NAME}.`;
  return text.length <= DESCRIPTION_MAX ? text : `${text.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: PageProps<"/projets/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getVisibleProjectBySlug(slug);
  if (!project) return { title: "Projet introuvable", robots: { index: false } };
  const title = `${project.name}, projet web`;
  const description = describeProject(project);
  return {
    title,
    description,
    alternates: { canonical: projectPath(slug) },
    openGraph: { type: "article", url: projectPath(slug), title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projets/[slug]">) {
  const { slug } = await params;
  const project = await getVisibleProjectBySlug(slug);
  if (!project) notFound();

  return (
    // The root layout locks the document scroll (OS shell): this page scrolls on its own.
    <main className="h-full overflow-y-auto bg-white px-6 py-12 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(buildProjectPageJsonLd(project)) }}
      />
      <article className="mx-auto flex max-w-2xl flex-col gap-6">
        <nav aria-label="Fil d'Ariane">
          <Link href="/" className={LINK_CLASS}>
            Portfolio de {DISPLAY_NAME}
          </Link>
        </nav>
        <header className="flex items-center gap-4">
          <Image
            src={project.logo_url}
            alt=""
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            className="rounded-2xl"
            priority
          />
          <h1 className="text-3xl font-semibold">{project.name}</h1>
        </header>
        <p className="text-lg">{describeProject(project)}</p>
        {project.tech.length > 0 && (
          <section aria-labelledby="project-tech">
            <h2 id="project-tech" className="mb-2 text-xl font-semibold">
              Technologies
            </h2>
            <ul className="flex flex-wrap gap-2">
              {project.tech.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </section>
        )}
        <p>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            Ouvrir {project.name}
            <span className="sr-only"> (nouvel onglet)</span>
          </a>
        </p>
      </article>
    </main>
  );
}
