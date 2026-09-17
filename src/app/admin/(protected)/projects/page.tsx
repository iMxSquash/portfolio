import type { Metadata } from "next";
import Link from "next/link";
import { DeleteProjectButton } from "@/components/admin/DeleteProjectButton";
import { MoveProjectButtons } from "@/components/admin/MoveProjectButtons";
import { AppIcon } from "@/components/os/AppIcon";
import { getAllProjectRows } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projets, Backoffice",
};

export default async function ProjectsPage() {
  const projects = await getAllProjectRows();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projets</h1>
        <Link
          href="/admin/projects/new"
          className="rounded-lg bg-system-blue px-4 py-2 text-sm font-medium text-white"
        >
          Nouveau projet
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucun projet pour le moment.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-black/10 text-neutral-500 dark:border-white/10">
              <tr>
                <th className="px-4 py-2 font-medium">Ordre</th>
                <th className="px-4 py-2 font-medium">Logo</th>
                <th className="px-4 py-2 font-medium">Nom</th>
                <th className="px-4 py-2 font-medium">Mode</th>
                <th className="px-4 py-2 font-medium">Visibilité</th>
                <th className="px-4 py-2 font-medium">Bureau</th>
                <th className="px-4 py-2 font-medium">Mobile</th>
                <th className="px-4 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr
                  key={project.id}
                  className="border-b border-black/5 last:border-0 dark:border-white/5"
                >
                  <td className="px-4 py-2">
                    <MoveProjectButtons
                      id={project.id}
                      disableUp={index === 0}
                      disableDown={index === projects.length - 1}
                    />
                  </td>
                  <td className="px-4 py-2">
                    {project.logo_url ? (
                      <div className="h-8 w-8">
                        <AppIcon app={{ icon: project.logo_url, name: project.name }} />
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 font-medium">{project.name}</td>
                  <td className="px-4 py-2">{project.display_mode}</td>
                  <td className="px-4 py-2">{project.visible ? "Visible" : "Masqué"}</td>
                  <td className="px-4 py-2">{project.show_on_desktop ? "Oui" : "Non"}</td>
                  <td className="px-4 py-2">{project.show_on_mobile ? "Oui" : "Non"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="text-sm text-system-blue hover:underline"
                      >
                        Modifier
                      </Link>
                      <DeleteProjectButton id={project.id} name={project.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
