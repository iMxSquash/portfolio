/**
 * Validated once, here, instead of a `!` non-null assertion at each of the 3
 * Supabase client call sites (browser/server/edge — see check-security
 * skill and CLAUDE.md's "valider les variables d'environnement au
 * démarrage, fail fast"). Each `process.env.NEXT_PUBLIC_*` access below must
 * stay written out literally: Next.js inlines `NEXT_PUBLIC_*` vars into the
 * client bundle by matching that exact textual pattern at build time, and
 * would silently fail to do so behind an indirection like `process.env[name]`.
 */
function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const SUPABASE_URL = requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
export const SUPABASE_ANON_KEY = requireEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
