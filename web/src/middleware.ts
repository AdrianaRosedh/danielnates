import type { MiddlewareHandler } from "astro";
import { getLocaleFromUrl } from "./lib/i18n";
import { getAdminScopeFor, getUserFromRequest } from "./lib/supabase";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.locale = getLocaleFromUrl(context.url);

  const path = context.url.pathname;

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
  }

  return next();
};
