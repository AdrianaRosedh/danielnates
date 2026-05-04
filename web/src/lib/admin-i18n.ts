import type { AstroCookies } from "astro";

export type AdminLang = "es" | "en";
export type AdminApp = "daniel" | "fritanguita";

export const ADMIN_LANG_COOKIE = "dn_admin_lang";
export const ADMIN_APP_COOKIE = "dn_admin_app";

export function getAdminLang(cookies: AstroCookies): AdminLang {
  const v = cookies.get(ADMIN_LANG_COOKIE)?.value;
  return v === "en" ? "en" : "es";
}

/** Reads the current admin app preference. Note: the app a user can
 *  ACTUALLY operate in is the intersection of this cookie and their
 *  admin_emails.scope — scoped users are locked to their scope and
 *  the cookie is ignored for them. */
export function getAdminApp(cookies: AstroCookies): AdminApp {
  const v = cookies.get(ADMIN_APP_COOKIE)?.value;
  return v === "fritanguita" ? "fritanguita" : "daniel";
}

/** Resolves the EFFECTIVE app for a request given the cookie + scope.
 *  Full admins respect the cookie; scoped users are locked. */
export function effectiveAdminApp(cookies: AstroCookies, scope: string | undefined): AdminApp {
  if (scope && scope !== "all") {
    return scope === "fritanguita" ? "fritanguita" : "daniel";
  }
  return getAdminApp(cookies);
}

/** Inline ES/EN helper for admin pages. Avoids a separate dictionary —
 *  each call site pairs the two languages directly so context stays
 *  with the string. Usage:
 *
 *    const t = txFor(lang);
 *    <h1>{t("Dashboard", "Dashboard")}</h1>
 *    <p>{t("Notas, ensayos, lecturas.", "Notes, essays, readings.")}</p>
 */
export function txFor(lang: AdminLang) {
  return (es: string, en: string): string => (lang === "en" ? en : es);
}
