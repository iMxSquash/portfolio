import { cache } from "react";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Server Supabase client — used in Server Components, Server Actions and
 * the admin middleware. Carries the visitor's session via cookies, so RLS
 * (`auth.role() = 'authenticated'`) applies exactly as it would client-side.
 * Wrapped in React's `cache()` (the pattern Supabase's own Next.js SSR docs
 * recommend) so the several call sites that each need a client within one
 * request (the protected layout's auth check, a page's data fetch, a Server
 * Action) share a single instance instead of re-reading cookies each time.
 */
export const createClient = cache(async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component that can't set cookies — the
          // middleware below already refreshes the session on every
          // request, so this is safe to ignore.
        }
      },
    },
  });
});
