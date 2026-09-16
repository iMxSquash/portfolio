import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/env";

const ADMIN_LOGIN_PATH = "/admin/login";

/**
 * Refreshes the Supabase session on every request and gates `/admin/*`
 * (except the login page itself) behind it. Defense in depth alongside the
 * `AdminLayout` server-side check — see TODO.md Phase 7.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname === ADMIN_LOGIN_PATH;

  if (isAdminRoute && !isLoginRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginRoute && user) {
    const projectsUrl = request.nextUrl.clone();
    projectsUrl.pathname = "/admin/projects";
    return NextResponse.redirect(projectsUrl);
  }

  return response;
}
