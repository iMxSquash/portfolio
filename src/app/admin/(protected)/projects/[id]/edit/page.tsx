import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { updateProject } from "@/app/admin/(protected)/projects/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { getProjectRowById } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Modifier un projet, Backoffice",
};

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectRowById(id);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Modifier {project.name}</h1>
      <ProjectForm action={updateProject.bind(null, id)} project={project} />
    </div>
  );
}
