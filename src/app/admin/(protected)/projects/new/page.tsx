import type { Metadata } from "next";
import { createProject } from "@/app/admin/(protected)/projects/actions";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = {
  title: "Nouveau projet — Backoffice",
};

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Nouveau projet</h1>
      <ProjectForm action={createProject} />
    </div>
  );
}
