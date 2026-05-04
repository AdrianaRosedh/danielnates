import type { Locale } from "./types";
import type { PortableTextBlock } from "@portabletext/types";

/* Legacy aliases — Sanity-style bilingual objects {es, en}.
   Kept for any leftover code that hasn't migrated yet. */
interface BilingualText { es?: string | null; en?: string | null }
interface BilingualBlocks { es?: PortableTextBlock[] | null; en?: PortableTextBlock[] | null }

export const LOCALES = ["es", "en"] as const;
export const DEFAULT_LOCALE: Locale = "es";

export function getLocaleFromUrl(url: URL | string): Locale {
  const pathname = typeof url === "string" ? url : url.pathname;
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg === "en" ? "en" : "es";
}

/** Pick the right language for a bilingual text field, with graceful fallback. */
export function t(field: BilingualText | null | undefined, locale: Locale): string {
  if (!field) return "";
  return (field[locale] ?? field.es ?? field.en ?? "") as string;
}

/** Pick the right language for a bilingual blocks field. */
export function tb(field: BilingualBlocks | null | undefined, locale: Locale): PortableTextBlock[] {
  if (!field) return [];
  return (field[locale] ?? field.es ?? field.en ?? []) as PortableTextBlock[];
}

/** Pick the right value from paired _es / _en columns (Supabase shape). */
export function t2(es: string | null | undefined, en: string | null | undefined, locale: Locale): string {
  if (locale === "es") return es ?? en ?? "";
  return en ?? es ?? "";
}

/** Same, for paired Portable Text block columns. */
export function tb2<T>(es: T[] | null | undefined, en: T[] | null | undefined, locale: Locale): T[] {
  if (locale === "es") return es ?? en ?? [];
  return en ?? es ?? [];
}

/** Build a localized href. ES routes have no prefix, EN gets /en. */
export function href(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === "es") return clean;
  if (clean === "/") return "/en";
  return `/en${clean}`;
}

/** Strip any locale prefix from a pathname. Useful for the language switcher. */
export function stripLocale(pathname: string): string {
  if (pathname === "/en" || pathname === "/en/") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname || "/";
}

/** Switch the locale on a given pathname. */
export function switchLocale(pathname: string, target: Locale): string {
  return href(stripLocale(pathname), target);
}

/** Press page has different slugs per locale. */
export function pressHref(locale: Locale): string {
  return locale === "es" ? "/prensa" : "/en/press";
}

/** Daily Brief page has different slugs per locale. */
export function dayHref(locale: Locale): string {
  return locale === "es" ? "/dia" : "/en/day";
}

/** About page has different slugs per locale. */
export function aboutHref(locale: Locale): string {
  return locale === "es" ? "/sobre" : "/en/about";
}

/** Projects directory has different slugs per locale. */
export function projectsHref(locale: Locale): string {
  return locale === "es" ? "/proyectos" : "/en/projects";
}

/* ── UI strings (everything that isn't authored in Sanity) ─────────── */
type UiKey =
  | "home"
  | "diary"
  | "art"
  | "projects"
  | "fieldNotes"
  | "press"
  | "contact"
  | "explore"
  | "back"
  | "noEntries"
  | "noProjects"
  | "noArt"
  | "readMore"
  | "openInNewTab"
  | "viewAll"
  | "languageSpanish"
  | "languageEnglish"
  | "skipIntro"
  | "primaryProject"
  | "secondaryProject"
  | "pastProject"
  | "centralProject"
  | "fastRhythm"
  | "archive"
  | "chapter"
  | "name"
  | "email"
  | "message"
  | "send"
  | "thankYou"
  | "contactPrompt"
  | "404Title"
  | "404Body"
  | "backHome"
  | "min"
  | "servings"
  | "ingredients"
  | "steps"
  | "loading"
  | "errorGeneric";

const messages: Record<Locale, Record<UiKey, string>> = {
  es: {
    home: "Inicio",
    diary: "Diario",
    art: "Arte",
    projects: "Proyectos",
    fieldNotes: "Field Notes",
    press: "Prensa",
    contact: "Contacto",
    explore: "Explorar",
    back: "Volver",
    noEntries: "Sin entradas todavía.",
    noProjects: "Sin proyectos todavía.",
    noArt: "Sin piezas todavía.",
    readMore: "Leer más",
    openInNewTab: "Abrir en nueva pestaña",
    viewAll: "Ver todo",
    languageSpanish: "Español",
    languageEnglish: "English",
    skipIntro: "Saltar",
    primaryProject: "Primario",
    secondaryProject: "Secundario",
    pastProject: "Pasado",
    centralProject: "Proyecto central",
    fastRhythm: "Ritmo rápido",
    archive: "Archivo",
    chapter: "Capítulo",
    name: "Nombre",
    email: "Email",
    message: "Mensaje",
    send: "Enviar",
    thankYou: "Gracias. Te respondo pronto.",
    contactPrompt: "Escribe.",
    "404Title": "Aquí no hay nada.",
    "404Body": "La página que buscas no existe — o se mudó, como las cartas con la temporada.",
    backHome: "Volver al inicio",
    min: "min",
    servings: "porciones",
    ingredients: "Ingredientes",
    steps: "Procedimiento",
    loading: "Cargando…",
    errorGeneric: "Algo no cuadró. Intenta de nuevo.",
  },
  en: {
    home: "Home",
    diary: "Journal",
    art: "Art",
    projects: "Projects",
    fieldNotes: "Field Notes",
    press: "Press",
    contact: "Contact",
    explore: "Explore",
    back: "Back",
    noEntries: "No entries yet.",
    noProjects: "No projects yet.",
    noArt: "No pieces yet.",
    readMore: "Read more",
    openInNewTab: "Open in new tab",
    viewAll: "View all",
    languageSpanish: "Español",
    languageEnglish: "English",
    skipIntro: "Skip",
    primaryProject: "Primary",
    secondaryProject: "Secondary",
    pastProject: "Past",
    centralProject: "Central project",
    fastRhythm: "Fast pace",
    archive: "Archive",
    chapter: "Chapter",
    name: "Name",
    email: "Email",
    message: "Message",
    send: "Send",
    thankYou: "Thanks. I'll get back to you soon.",
    contactPrompt: "Write.",
    "404Title": "Nothing here.",
    "404Body": "The page you're looking for doesn't exist — or it moved, the way menus do with the season.",
    backHome: "Back to home",
    min: "min",
    servings: "servings",
    ingredients: "Ingredients",
    steps: "Method",
    loading: "Loading…",
    errorGeneric: "Something didn't add up. Please try again.",
  },
};

export function ui(key: UiKey, locale: Locale): string {
  return messages[locale]?.[key] ?? messages.es[key] ?? key;
}

export function dateFormat(dateStr: string | undefined, locale: Locale): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}
