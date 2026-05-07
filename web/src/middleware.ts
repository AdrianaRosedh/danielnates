import type { MiddlewareHandler } from "astro";
import { getLocaleFromUrl } from "./lib/i18n";
import { getAdminScopeFor, getUserFromRequest } from "./lib/supabase";
import { effectiveAdminApp, getAdminLang } from "./lib/admin-i18n";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.locale = getLocaleFromUrl(context.url);

  const path = context.url.pathname;

  // Resolve admin chrome language for any admin/* request (cheap cookie read).
  if (path.startsWith("/admin") || path.startsWith("/api/admin")) {
    context.locals.adminLang = getAdminLang(context.cookies);
  }

  // Gate /admin/* — but allow login + auth callback
  if (path.startsWith("/admin") && !path.startsWith("/admin/login") && !path.startsWith("/admin/auth")) {
    const user = await getUserFromRequest(context.cookies);
    if (!user) {
      return context.redirect(`/admin/login?next=${encodeURIComponent(path)}`);
    }
    context.locals.user = user;

    // Resolve admin scope: 'all' = full admin, '<slug>' = scoped to one
    // project. If the user is logged in but not in admin_emails at all,
    // bounce to login (denied at DB level anyway, but better UX).
    const scope = await getAdminScopeFor(user.email);
    if (!scope) {
      return context.redirect(`/admin/login?error=No+autorizado`);
    }
    context.locals.adminScope = scope;

    // Effective admin app: cookie-driven for full admins, scope-locked
    // for scoped users. This drives the sidebar nav + filtered views.
    context.locals.adminApp = effectiveAdminApp(context.cookies, scope);
    context.locals.isAdmin = true;
  }
  // Resolve admin status on PUBLIC pages too — non-blocking. If the
  // visitor is signed in AND in admin_emails, the public BaseLayout
  // mounts the inline-edit overlay so they can edit content directly
  // on the live site. Skip for static assets and API routes.
  else if (
    !path.startsWith("/api/") &&
    !path.startsWith("/_") &&
    !/\.[a-z0-9]+$/i.test(path)
  ) {
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

  return next();
};
