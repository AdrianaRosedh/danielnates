import type { APIRoute } from "astro";
import { ADMIN_LANG_COOKIE, type AdminLang } from "../../../lib/admin-i18n";

export const prerender = false;

/**
 * Sets the admin chrome language cookie. Independent of the public site
 * locale. Returns 303 back to the page the toggle was clicked from.
 */
export const GET: APIRoute = async ({ url, cookies, request }) => {
  const requested = url.searchParams.get("lang");
  const lang: AdminLang = requested === "en" ? "en" : "es";

  cookies.set(ADMIN_LANG_COOKIE, lang, {
    path: "/",
    httpOnly: false,             // useful client-side too
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,  // 1 year
  });

  const back = url.searchParams.get("from") ?? request.headers.get("referer") ?? "/admin";
  return Response.redirect(new URL(back, url.origin).toString(), 303);
};
