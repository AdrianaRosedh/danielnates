import type { APIRoute } from "astro";
import { ADMIN_APP_COOKIE, type AdminApp } from "../../../lib/admin-i18n";
import { getAdminScopeFor, getUserFromRequest } from "../../../lib/supabase";

export const prerender = false;

/**
 * Switches the admin app context (Daniel ↔ Fritanguita).
 *
 * Scoped users (admin_emails.scope !== 'all') CANNOT switch — the
 * cookie is set but middleware/RLS would ignore it anyway, so we
 * reject early to avoid confusing UX.
 *
 * GET ?app=daniel|fritanguita&from=<path>
 */
export const GET: APIRoute = async ({ url, cookies, request }) => {
  const user = await getUserFromRequest(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const scope = await getAdminScopeFor(user.email);
  if (!scope) return new Response("Forbidden", { status: 403 });

  const requested = url.searchParams.get("app");
  const next: AdminApp = requested === "fritanguita" ? "fritanguita" : "daniel";

  if (scope !== "all" && scope !== next) {
    return new Response("Cannot switch outside your scope", { status: 403 });
  }

  cookies.set(ADMIN_APP_COOKIE, next, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  /* Sensible default destinations: /admin for Daniel app, the
   * Fritanguita project edit for the Fritanguita app. */
  let dest = url.searchParams.get("from") ?? request.headers.get("referer") ?? "/admin";
  if (next === "fritanguita") dest = "/admin/projects";

  return Response.redirect(new URL(dest, url.origin).toString(), 303);
};
