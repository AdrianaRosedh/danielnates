import type { AstroCookies } from "astro";

export type AdminLang = "es" | "en";

export const ADMIN_LANG_COOKIE = "dn_admin_lang";

export function getAdminLang(cookies: AstroCookies): AdminLang {
  const v = cookies.get(ADMIN_LANG_COOKIE)?.value;
  return v === "en" ? "en" : "es";
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
