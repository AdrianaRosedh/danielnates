import type { MiddlewareHandler } from "astro";
import { getLocaleFromUrl } from "./lib/i18n";
import { getUserFromRequest } from "./lib/supabase";

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
  }

  return next();
};
