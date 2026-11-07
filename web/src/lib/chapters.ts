/**
 * The site's narrative spine. Every main page is a room in one house;
 * this is the order a visitor walks them. NextChapter.astro reads it
 * to close each page with a door into the next — the story never
 * dead-ends.
 *
 * Hrefs are stored per locale because route names are asymmetric
 * (sobre↔about, prensa↔press, contacto↔contact, dia↔day).
 */
import type { Locale } from "./types";

export interface Chapter {
  /** Stable key — also matched against the current pathname. */
  key: string;
  href: Record<Locale, string>;
  title: Record<Locale, string>;
  /** One story line — why you'd open this door. */
  line: Record<Locale, string>;
}

export const JOURNEY: Chapter[] = [
  {
    key: "inicio",
    href: { es: "/", en: "/en" },
    title: { es: "Inicio", en: "Home" },
    line: { es: "La película, desde el principio.", en: "The film, from the top." },
  },
  {
    key: "sobre",
    href: { es: "/sobre", en: "/en/about" },
    title: { es: "Sobre", en: "About" },
    line: { es: "El cocinero detrás de la mesa.", en: "The cook behind the table." },
  },
  {
    key: "proyectos",
    href: { es: "/proyectos", en: "/en/projects" },
    title: { es: "Proyectos", en: "Projects" },
    line: { es: "Lo que está abierto ahora mismo.", en: "What's open right now." },
  },
  {
    key: "diario",
    href: { es: "/diario", en: "/en/diario" },
    title: { es: "Diario", en: "Journal" },
    line: { es: "Notas desde la cocina y el papel.", en: "Notes from the kitchen and the page." },
  },
  {
    key: "dia",
    href: { es: "/dia", en: "/en/day" },
    title: { es: "Día", en: "Day" },
    line: { es: "Una imagen y una línea, casi a diario.", en: "An image and a line, almost daily." },
  },
  {
    key: "arte",
    href: { es: "/arte", en: "/en/arte" },
    title: { es: "Arte", en: "Art" },
    line: { es: "Lo que la mano también hace.", en: "What the hand also does." },
  },
  {
    key: "prensa",
    href: { es: "/prensa", en: "/en/press" },
    title: { es: "Prensa", en: "Press" },
    line: { es: "Lo que se ha dicho de esta cocina.", en: "What's been said about this kitchen." },
  },
  {
    key: "contacto",
    href: { es: "/contacto", en: "/en/contact" },
    title: { es: "Contacto", en: "Contact" },
    line: { es: "Prensa, colaboraciones, una idea.", en: "Press, collaborations, an idea." },
  },
];

/** The chapter that follows the given key — wraps back to the start. */
export function nextChapter(currentKey: string): Chapter {
  const i = JOURNEY.findIndex((c) => c.key === currentKey);
  return JOURNEY[(i + 1) % JOURNEY.length] ?? JOURNEY[0];
}
