import type { APIRoute } from "astro";
import { ADMIN_APP_COOKIE, type AdminApp } from "../../../lib/admin-i18n";
import { getAdminScopeFor, getUserFromRequest } from "../../../lib/supabase";
import { safeNextPath, safeRefererPath } from "../../../lib/security";

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
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 365,
  });

  /* Same-origin destinations only: /admin (or where the toggle was
   * clicked) for Daniel, the projects list for Fritanguita. */
  const from = url.searchParams.get("from");
  const dest =
    next === "fritanguita"
      ? "/admin/projects"
      : from
        ? safeNextPath(from)
        : safeRefererPath(request.headers.get("referer"), url.origin);

  return Response.redirect(`${url.origin}${dest}`, 303);
};
