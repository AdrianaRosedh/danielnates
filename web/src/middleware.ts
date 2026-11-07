import type { MiddlewareHandler } from "astro";
import { getLocaleFromUrl } from "./lib/i18n";
import { getAdminScopeFor, getUserFromRequest } from "./lib/supabase";
import { effectiveAdminApp, getAdminLang } from "./lib/admin-i18n";
import { runWithRequestCache } from "./lib/request-cache";
import { securityHeaders } from "./lib/security";

const HEADERS = Object.entries(securityHeaders(import.meta.env.PROD));

/** Admin routes reachable without an admin session. Logout must stay
 *  open to any signed-in user, or a non-admin could never sign out. */
const ADMIN_OPEN = ["/admin/login", "/admin/auth", "/admin/logout"];

/** Merge the security headers into a response. Some responses (e.g.
 *  Response.redirect) carry immutable headers — rebuild those. */
function withSecurityHeaders(res: Response): Response {
  try {
    for (const [k, v] of HEADERS) if (!res.headers.has(k)) res.headers.set(k, v);
    return res;
  } catch {
    const headers = new Headers(res.headers);
    for (const [k, v] of HEADERS) if (!headers.has(k)) headers.set(k, v);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  }
}

export const onRequest: MiddlewareHandler = (context, next) =>
  runWithRequestCache(async () => {
    context.locals.locale = getLocaleFromUrl(context.url);

    // Prerendered routes (404s) build without a real request — no
    // cookies/headers exist, so skip the session work entirely.
    if (context.isPrerendered) return next();

    const path = context.url.pathname;

    // Admin chrome language for any admin/* request (cheap cookie read).
    if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
      context.locals.adminLang = getAdminLang(context.cookies);
    }

    if (path.startsWith("/admin") && !ADMIN_OPEN.some((p) => path.startsWith(p))) {
      const user = await getUserFromRequest(context.cookies);
      if (!user) {
        return withSecurityHeaders(context.redirect(`/admin/login?next=${encodeURIComponent(path)}`));
      }
      context.locals.user = user;

      // 'all' = full admin, '<slug>' = scoped to one project. Signed in
      // but not on the allowlist → back to login (RLS denies anyway).
      const scope = await getAdminScopeFor(user.email);
      if (!scope) return withSecurityHeaders(context.redirect("/admin/login?error=No+autorizado"));
      context.locals.adminScope = scope;
      context.locals.adminApp = effectiveAdminApp(context.cookies, scope);
      context.locals.isAdmin = true;
    } else if (!path.startsWith("/api/") && !path.startsWith("/_") && !/\.[a-z0-9]+$/i.test(path)) {
      // Public pages: resolve admin status (non-blocking) so BaseLayout
      // can mount the inline-edit overlay for allowlisted editors.
      const user = await getUserFromRequest(context.cookies);
      if (user) {
        const scope = await getAdminScopeFor(user.email);
        if (scope) {
          context.locals.user = user;
          context.locals.adminScope = scope;
          context.locals.isAdmin = true;
        }
      }
    }

    return withSecurityHeaders(await next());
  });
