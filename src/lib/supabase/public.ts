import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Anonymous Supabase client for public reads with no session (the OS's
 * project registry, see `src/lib/projects.ts`). No cookies involved — RLS
 * scopes it to `visible = true` rows regardless.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
