"use client";

import type { ReactNode } from "react";
import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  checkEmbeddability,
  type EmbedCheckResult,
  type ProjectFormState,
} from "@/app/admin/(protected)/projects/actions";
import { AppIcon } from "@/components/os/AppIcon";
import type { ProjectRow } from "@/lib/projects";

const INITIAL_STATE: ProjectFormState = {};

const INPUT_CLASSES =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-system-blue dark:border-white/15 dark:bg-white/5";

type ProjectFormProps = {
  action: (state: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  project?: ProjectRow;
};

/** Create/edit form for a `projects` row — shared by /admin/projects/new and /admin/projects/[id]/edit (see TODO.md Phase 7). */
export function ProjectForm({ action, project }: ProjectFormProps) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);
  const [url, setUrl] = useState(project?.url ?? "");
  const [embedCheck, setEmbedCheck] = useState<EmbedCheckResult | null>(null);
  const [isChecking, startCheckTransition] = useTransition();

  function handleCheckEmbeddability() {
    if (!url) return;
    startCheckTransition(async () => {
      setEmbedCheck(await checkEmbeddability(url));
    });
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <Field label="Nom" htmlFor="name">
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={project?.name}
          className={INPUT_CLASSES}
        />
      </Field>

      <Field
        label="Slug"
        htmlFor="slug"
        hint="Identifiant unique (ex. photoshop) — dérivé du nom si laissé vide."
      >
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={project?.slug}
          pattern="[a-z0-9-]*"
          className={INPUT_CLASSES}
        />
      </Field>

      <Field label="URL" htmlFor="url">
        <div className="flex gap-2">
          <input
            id="url"
            name="url"
            type="url"
            required
            defaultValue={project?.url}
            onChange={(event) => setUrl(event.target.value)}
            className={`${INPUT_CLASSES} flex-1`}
          />
          <button
            type="button"
            onClick={handleCheckEmbeddability}
            disabled={!url || isChecking}
            className="shrink-0 rounded-lg border border-black/10 px-3 py-2 text-sm disabled:opacity-50 dark:border-white/15"
          >
            {isChecking ? "Vérification…" : "Tester l'iframe"}
          </button>
        </div>
        {embedCheck ? (
          <p
            className={`mt-1.5 text-sm ${
              embedCheck.embeddable
                ? "text-green-600 dark:text-green-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {embedCheck.reason}
          </p>
        ) : null}
      </Field>

      <Field label="Mode d'affichage" htmlFor="display_mode">
        <select
          id="display_mode"
          name="display_mode"
          defaultValue={project?.display_mode ?? "iframe"}
          className={INPUT_CLASSES}
        >
          <option value="iframe">Iframe (sous-domaine maîtrisé)</option>
          <option value="external">Lien externe (nouvel onglet)</option>
        </select>
      </Field>

      <Field label="Description" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={project?.description ?? ""}
          className={INPUT_CLASSES}
        />
      </Field>

      <Field label="Technologies" htmlFor="tech" hint="Séparées par des virgules.">
        <input
          id="tech"
          name="tech"
          type="text"
          defaultValue={project?.tech?.join(", ")}
          className={INPUT_CLASSES}
        />
      </Field>

      <Field
        label={project ? "Remplacer le logo" : "Logo"}
        htmlFor="logo"
        hint="PNG, JPEG, WebP ou SVG, 2 Mo maximum."
      >
        {project?.logo_url ? (
          <div className="mb-2 flex items-center gap-3">
            <div className="h-10 w-10">
              <AppIcon app={{ icon: project.logo_url, name: project.name }} />
            </div>
            <span className="text-xs text-neutral-500">Logo actuel — laisser vide pour le garder</span>
          </div>
        ) : null}
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          required={!project}
          className="text-sm"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Largeur par défaut (px)" htmlFor="default_width">
          <input
            id="default_width"
            name="default_width"
            type="number"
            min={1}
            defaultValue={project?.default_width ?? ""}
            className={INPUT_CLASSES}
          />
        </Field>
        <Field label="Hauteur par défaut (px)" htmlFor="default_height">
          <input
            id="default_height"
            name="default_height"
            type="number"
            min={1}
            defaultValue={project?.default_height ?? ""}
            className={INPUT_CLASSES}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <Checkbox name="visible" label="Visible sur le portfolio" defaultChecked={project?.visible} />
        <Checkbox
          name="show_on_desktop"
          label="Afficher sur le bureau (desktop)"
          defaultChecked={project?.show_on_desktop}
        />
        <Checkbox
          name="show_on_mobile"
          label="Afficher sur le springboard (mobile)"
          defaultChecked={project?.show_on_mobile}
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <SubmitButton isEdit={Boolean(project)} />
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-neutral-500">{hint}</p> : null}
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked = true,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-black/20 dark:border-white/25"
      />
      {label}
    </label>
  );
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="self-start rounded-lg bg-system-blue px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer le projet"}
    </button>
  );
}
