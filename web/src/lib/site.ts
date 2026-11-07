/**
 * Site-wide constants — the one place for values that would otherwise be
 * repeated as literals across pages and components.
 *
 * Content that Daniel edits lives in Supabase; these are structural
 * defaults (fallback media, canonical external destinations) used when
 * the database has nothing set.
 */

/** Canonical origin (env-overridable for previews). */
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL ?? "https://danielnates.com";

/** Fallback media shipped in /public. */
export const MEDIA = {
  /** Daniel in the Olivea garden — 7008 × 4672 original. Default portrait,
   *  hero poster and press photo until Daniel sets his own. */
  portrait: "/media/hero/daniel-garden.jpg",
  portraitMeta: "JPG · 7008 × 4672 · 1.2 MB",
} as const;

/** Verified external destinations (from Daniel's and the restaurants'
 *  official profiles). Project-specific links are editable in
 *  projects.links; these are the fallbacks and structural links. */
export const EXTERNAL = {
  oliveaReservations: "https://www.opentable.com/r/olivea-farm-to-table-ensenada",
  oliveaTeamProfile: "https://www.oliveafarmtotable.com/team/danielnates",
  fritanguitaInstagram: "https://www.instagram.com/fritanguita_/",
} as const;
