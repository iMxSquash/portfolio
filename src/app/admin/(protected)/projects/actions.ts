"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProjectFormState = { error?: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const DISPLAY_MODES = ["iframe", "external"] as const;
const ALLOWED_LOGO_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const LOGOS_PUBLIC_PATH_MARKER = "/storage/v1/object/public/logos/";

/**
 * Every mutating action is also reachable directly as its own endpoint (a
 * Server Action isn't gated by the page it's rendered from), so each one
 * must re-check the session itself — the middleware and layout checks only
 * cover page navigations (see check-security skill). Centralized here
 * instead of repeated per action: wraps an action body with the client +
 * admin check, and hands the authenticated client to the body.
 */
function withAdmin<Args extends unknown[], Result>(
  action: (supabase: SupabaseServerClient, ...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      redirect("/admin/login");
    }
    return action(supabase, ...args);
  };
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type ParsedProjectFields = {
  name: string;
  slug: string;
  url: string;
  description: string | null;
  tech: string[];
  display_mode: (typeof DISPLAY_MODES)[number];
  show_on_desktop: boolean;
  show_on_mobile: boolean;
  visible: boolean;
  default_width: number | null;
  default_height: number | null;
};

function parseProjectFields(formData: FormData): { data: ParsedProjectFields } | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const techInput = String(formData.get("tech") ?? "").trim();
  const displayMode = String(formData.get("display_mode") ?? "");
  const defaultWidthInput = String(formData.get("default_width") ?? "").trim();
  const defaultHeightInput = String(formData.get("default_height") ?? "").trim();

  if (!name) return { error: "Le nom est requis." };
  if (!url) return { error: "L'URL est requise." };

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { error: "L'URL n'est pas valide." };
  }
  if (parsedUrl.protocol !== "https:") {
    return { error: "L'URL doit être en https." };
  }

  if (!DISPLAY_MODES.includes(displayMode as (typeof DISPLAY_MODES)[number])) {
    return { error: "Mode d'affichage invalide." };
  }

  const slug = slugify(slugInput || name);
  if (!slug) return { error: "Le slug est invalide." };

  const defaultWidth = defaultWidthInput ? Number(defaultWidthInput) : null;
  const defaultHeight = defaultHeightInput ? Number(defaultHeightInput) : null;
  if (defaultWidth !== null && (!Number.isFinite(defaultWidth) || defaultWidth <= 0)) {
    return { error: "La largeur par défaut est invalide." };
  }
  if (defaultHeight !== null && (!Number.isFinite(defaultHeight) || defaultHeight <= 0)) {
    return { error: "La hauteur par défaut est invalide." };
  }

  return {
    data: {
      name,
      slug,
      url,
      description: description || null,
      tech: techInput
        ? techInput
            .split(",")
            .map((entry) => entry.trim())
            .filter(Boolean)
        : [],
      display_mode: displayMode as (typeof DISPLAY_MODES)[number],
      show_on_desktop: formData.get("show_on_desktop") === "on",
      show_on_mobile: formData.get("show_on_mobile") === "on",
      visible: formData.get("visible") === "on",
      default_width: defaultWidth,
      default_height: defaultHeight,
    },
  };
}

async function uploadLogo(
  supabase: SupabaseServerClient,
  file: File,
  slug: string,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_LOGO_TYPES.has(file.type)) {
    return { error: "Format de logo non supporté (PNG, JPEG, WebP ou SVG uniquement)." };
  }
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    return { error: "Le logo dépasse la taille maximale de 2 Mo." };
  }

  const extension = file.type === "image/svg+xml" ? "svg" : file.type.split("/")[1];
  const path = `${slug}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage.from("logos").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    return { error: "Échec de l'upload du logo." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("logos").getPublicUrl(path);
  return { url: publicUrl };
}

/** Only removes objects that actually live in the `logos` Storage bucket — never the static /img/logos/*.svg seeded for the original 3 apps. */
async function deleteLogoIfManaged(supabase: SupabaseServerClient, logoUrl: string | undefined) {
  if (!logoUrl) return;
  const markerIndex = logoUrl.indexOf(LOGOS_PUBLIC_PATH_MARKER);
  if (markerIndex === -1) return;
  const path = logoUrl.slice(markerIndex + LOGOS_PUBLIC_PATH_MARKER.length);
  await supabase.storage.from("logos").remove([path]);
}

async function nextSortOrder(supabase: SupabaseServerClient): Promise<number> {
  const { data } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

function uniqueSlugError(error: { code?: string } | null): string | null {
  return error?.code === "23505" ? "Ce slug est déjà utilisé par un autre projet." : null;
}

/** The OS registry (`/`) and the admin list both read from `projects` — revalidate both after any mutation. */
function revalidateProjectPaths(): void {
  revalidatePath("/");
  revalidatePath("/admin/projects");
}

export const createProject = withAdmin(async function createProject(
  supabase,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const logoFile = formData.get("logo");
  if (!(logoFile instanceof File) || logoFile.size === 0) {
    return { error: "Le logo est requis." };
  }

  // Independent I/O — the logo upload and the next sort position don't
  // depend on each other.
  const [uploaded, sortOrder] = await Promise.all([
    uploadLogo(supabase, logoFile, parsed.data.slug),
    nextSortOrder(supabase),
  ]);
  if ("error" in uploaded) return { error: uploaded.error };

  const { error } = await supabase.from("projects").insert({
    ...parsed.data,
    logo_url: uploaded.url,
    sort_order: sortOrder,
  });

  if (error) {
    await deleteLogoIfManaged(supabase, uploaded.url);
    return { error: uniqueSlugError(error) ?? "Échec de l'enregistrement du projet." };
  }

  revalidateProjectPaths();
  redirect("/admin/projects");
});

export const updateProject = withAdmin(async function updateProject(
  supabase,
  id: string,
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  const parsed = parseProjectFields(formData);
  if ("error" in parsed) return { error: parsed.error };

  const { data: existing, error: fetchError } = await supabase
    .from("projects")
    .select("logo_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !existing) {
    return { error: "Projet introuvable." };
  }

  let logoUrl = existing.logo_url as string;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    const uploaded = await uploadLogo(supabase, logoFile, parsed.data.slug);
    if ("error" in uploaded) return { error: uploaded.error };
    await deleteLogoIfManaged(supabase, logoUrl);
    logoUrl = uploaded.url;
  }

  const { error } = await supabase
    .from("projects")
    .update({ ...parsed.data, logo_url: logoUrl })
    .eq("id", id);

  if (error) {
    return { error: uniqueSlugError(error) ?? "Échec de la mise à jour du projet." };
  }

  revalidateProjectPaths();
  redirect("/admin/projects");
});

export const deleteProject = withAdmin(async function deleteProject(
  supabase,
  id: string,
): Promise<void> {
  const { data: row } = await supabase
    .from("projects")
    .select("logo_url")
    .eq("id", id)
    .maybeSingle();

  // Independent writes once we know the logo path — the Storage object and
  // the DB row don't depend on each other.
  await Promise.all([
    deleteLogoIfManaged(supabase, row?.logo_url as string | undefined),
    supabase.from("projects").delete().eq("id", id),
  ]);

  revalidateProjectPaths();
});

export const moveProject = withAdmin(async function moveProject(
  supabase,
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const { data: rows } = await supabase
    .from("projects")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });
  if (!rows) return;

  const index = rows.findIndex((row) => row.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= rows.length) return;

  const current = rows[index];
  const swap = rows[swapIndex];

  await supabase.from("projects").update({ sort_order: swap.sort_order }).eq("id", current.id);
  await supabase.from("projects").update({ sort_order: current.sort_order }).eq("id", swap.id);

  revalidateProjectPaths();
});

const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^0\.0\.0\.0$/,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
];

export type EmbedCheckResult = { embeddable: boolean; reason: string };

/** HEAD is enough to read the embedding-relevant headers — falls back to GET only if the server rejects HEAD. */
async function fetchForEmbedCheck(url: URL): Promise<Response> {
  const headResponse = await fetch(url, {
    method: "HEAD",
    redirect: "follow",
    signal: AbortSignal.timeout(8000),
  });
  if (headResponse.status === 405 || headResponse.status === 501) {
    return fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(8000) });
  }
  return headResponse;
}

/** Fetches `url` server-side and inspects the headers that control iframe embedding — suggests `iframe` vs `external` for the form (see TODO.md Phase 7). */
export const checkEmbeddability = withAdmin(async function checkEmbeddability(
  _supabase,
  url: string,
): Promise<EmbedCheckResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { embeddable: false, reason: "L'URL n'est pas valide." };
  }
  if (parsedUrl.protocol !== "https:") {
    return { embeddable: false, reason: "L'URL doit être en https." };
  }
  if (PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(parsedUrl.hostname))) {
    return { embeddable: false, reason: "Cette adresse n'est pas vérifiable." };
  }

  try {
    const response = await fetchForEmbedCheck(parsedUrl);
    const xFrameOptions = response.headers.get("x-frame-options");
    const csp = response.headers.get("content-security-policy");

    if (xFrameOptions && /deny|sameorigin/i.test(xFrameOptions)) {
      return {
        embeddable: false,
        reason: `Header X-Frame-Options: ${xFrameOptions} : ce site refuse l'affichage en iframe, utiliser le mode "external".`,
      };
    }
    if (csp && /frame-ancestors\s+'none'/i.test(csp)) {
      return {
        embeddable: false,
        reason: 'La CSP de ce site interdit frame-ancestors : utiliser le mode "external".',
      };
    }
    if (csp && /frame-ancestors/i.test(csp) && !/elwen\.dev/i.test(csp)) {
      return {
        embeddable: false,
        reason:
          'La CSP de ce site restreint frame-ancestors à d\'autres domaines : utiliser le mode "external".',
      };
    }
    return {
      embeddable: true,
      reason: 'Aucun header ne bloque l\'iframe : le mode "iframe" devrait fonctionner.',
    };
  } catch {
    return {
      embeddable: false,
      reason: "Impossible de charger l'URL pour vérifier (timeout ou erreur réseau).",
    };
  }
});
