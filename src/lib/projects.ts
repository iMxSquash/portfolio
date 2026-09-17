import { PROJECT_APP_DEFAULT_SIZE, PROJECT_APP_MIN_SIZE, type AppDefinition } from "@/lib/apps";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/** Row shape of the `projects` table (see supabase/migrations) — `logo_url` is `not null` at the schema level, matching the form requiring one on creation. */
export type ProjectRow = {
  id: string;
  name: string;
  slug: string;
  url: string;
  logo_url: string;
  display_mode: "iframe" | "external";
  description: string | null;
  tech: string[];
  sort_order: number;
  visible: boolean;
  show_on_desktop: boolean;
  show_on_mobile: boolean;
  default_width: number | null;
  default_height: number | null;
  created_at: string;
};

/** Maps a `projects` row to the `AppDefinition` the OS registry expects (see os-apps skill). */
export function projectRowToApp(row: ProjectRow): AppDefinition {
  return {
    id: row.slug,
    name: row.name,
    icon: row.logo_url,
    type: row.display_mode,
    url: row.url,
    showOnDesktop: row.show_on_desktop,
    showOnMobile: row.show_on_mobile,
    defaultSize: {
      width: row.default_width ?? PROJECT_APP_DEFAULT_SIZE.width,
      height: row.default_height ?? PROJECT_APP_DEFAULT_SIZE.height,
    },
    minSize: PROJECT_APP_MIN_SIZE,
  };
}

/**
 * Visible projects, fetched anonymously (RLS scopes this to `visible =
 * true`). Used server-side in `page.tsx`, both for the OS app registry (via
 * `getVisibleProjectApps`) and for the SEO fallback content, which needs the
 * raw `description`/`tech` fields `AppDefinition` doesn't carry.
 */
export async function getVisibleProjectRows(): Promise<ProjectRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load visible projects from Supabase", error);
    return [];
  }

  return data as ProjectRow[];
}

/** Project apps for the OS registry — see os-apps skill for how the result gets merged with `SYSTEM_APPS` and handed to the client via `useAppsStore`. */
export async function getVisibleProjectApps(): Promise<AppDefinition[]> {
  const rows = await getVisibleProjectRows();
  return rows.map(projectRowToApp);
}

/** Every project (including hidden ones), for the `/admin/projects` list — requires an authenticated session (RLS). */
export async function getAllProjectRows(): Promise<ProjectRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to load projects from Supabase", error);
    return [];
  }

  return data as ProjectRow[];
}

export async function getProjectRowById(id: string): Promise<ProjectRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (error) {
    console.error("Failed to load project from Supabase", error);
    return null;
  }

  return data as ProjectRow | null;
}
