import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { createClient } from "@/lib/supabase/server";

// `robots.txt` only stops crawling, not indexing (see seo-geo-boost skill) —
// this is the actual "keep /admin out of search results" mechanism.
export const metadata: Metadata = { robots: { index: false, follow: false } };

/**
 * Defense in depth alongside the root `middleware.ts`: every protected
 * admin route re-checks the session server-side (see check-security skill —
 * authorization must be verified on every request, not just at the edge).
 */
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      <header className="flex shrink-0 items-center justify-between border-b border-black/10 px-6 py-3 dark:border-white/10">
        <Link href="/admin/projects" className="text-sm font-semibold">
          Backoffice, Projets
        </Link>
        <SignOutButton />
      </header>
      <main className="flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
