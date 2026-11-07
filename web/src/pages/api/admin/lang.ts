import type { APIRoute } from "astro";
import { ADMIN_LANG_COOKIE, type AdminLang } from "../../../lib/admin-i18n";
import { safeNextPath, safeRefererPath } from "../../../lib/security";

export const prerender = false;

/**
 * Sets the admin chrome language cookie (independent of the public site
 * locale) and returns 303 to the page the toggle was clicked from —
 * same-origin paths only.
 */
export const GET: APIRoute = async ({ url, cookies, request }) => {
  const lang: AdminLang = url.searchParams.get("lang") === "en" ? "en" : "es";

  cookies.set(ADMIN_LANG_COOKIE, lang, {
    path: "/",
    httpOnly: false, // read client-side for the toggle state
    sameSite: "lax",
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 24 * 365,
  });

  const from = url.searchParams.get("from");
  const back = from
    ? safeNextPath(from)
    : safeRefererPath(request.headers.get("referer"), url.origin);
  return Response.redirect(`${url.origin}${back}`, 303);
};
