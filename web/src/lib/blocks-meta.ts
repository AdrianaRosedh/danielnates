/**
 * Block-builder registry.
 *
 * Single source of truth for the admin block library: which block types
 * exist, what label/category they show under, and the factory that
 * produces a fresh empty instance with a unique _key.
 */
import { v4 as uuid } from "uuid";
import type { PageBlock } from "./types";

export type BlockType = PageBlock["_type"];

export type BlockCategory = "media" | "text" | "layout" | "interactive" | "data";

export interface BlockMeta {
  type: BlockType;
  label: string;
  hint: string;
  category: BlockCategory;
  factory: () => PageBlock;
}

const k = () => uuid();

export const BLOCKS: BlockMeta[] = [
  /* ── Text ────────────────────────────────────────────────────────── */
  {
    type: "heroBlock",
    label: "Hero",
    hint: "Página de apertura: kicker + título grande + opcional fondo",
    category: "layout",
    factory: () => ({ _type: "heroBlock", _key: k(), eyebrow: "", title: "", subtitle: "", image_url: null, videoUrl: "", tone: "cinematic" }),
  },
  {
    type: "richTextBlock",
    label: "Texto",
    hint: "Párrafos de cuerpo. Texto largo, lectura cómoda",
    category: "text",
    factory: () => ({ _type: "richTextBlock", _key: k(), body: [], maxWidth: "comfort" }),
  },
  {
    type: "quoteBlock",
    label: "Cita",
    hint: "Quote o pull-quote",
    category: "text",
    factory: () => ({ _type: "quoteBlock", _key: k(), text: "", attribution: "", tone: "editorial" }),
  },
  {
    type: "marqueeBlock",
    label: "Marquesina",
    hint: "Texto en movimiento horizontal",
    category: "text",
    factory: () => ({ _type: "marqueeBlock", _key: k(), text: "", speed: "medium" }),
  },

  /* ── Media ───────────────────────────────────────────────────────── */
  {
    type: "imageBlock",
    label: "Imagen",
    hint: "Imagen única con caption opcional",
    category: "media",
    factory: () => ({ _type: "imageBlock", _key: k(), image_url: null, caption: "", alt: "", layout: "inline" }),
  },
  {
    type: "galleryBlock",
    label: "Galería",
    hint: "Múltiples imágenes en cuadrícula, tira o masonería",
    category: "media",
    factory: () => ({ _type: "galleryBlock", _key: k(), images: [], layout: "grid", caption: "" }),
  },
  {
    type: "videoBlock",
    label: "Video",
    hint: "Video subido o URL externa con poster",
    category: "media",
    factory: () => ({ _type: "videoBlock", _key: k(), videoUrl: "", poster_url: null, caption: "", autoplay: false, loop: true, layout: "inline" }),
  },
  {
    type: "audioBlock",
    label: "Audio",
    hint: "Pieza de audio con título/transcripción",
    category: "media",
    factory: () => ({ _type: "audioBlock", _key: k(), audioUrl: "", title: "", caption: "", transcript: "" }),
  },
  {
    type: "embedBlock",
    label: "Embed",
    hint: "iframe externo (YouTube, Vimeo, Spotify, etc.)",
    category: "media",
    factory: () => ({ _type: "embedBlock", _key: k(), url: "", caption: "", aspect: "16x9" }),
  },

  /* ── Layout ──────────────────────────────────────────────────────── */
  {
    type: "splitBlock",
    label: "Split (imagen + texto)",
    hint: "Dos columnas: medio + texto editorial bilingüe",
    category: "layout",
    factory: () => ({ _type: "splitBlock", _key: k(), orientation: "media-left", image_url: null, videoUrl: "", eyebrow: "", heading_es: "", heading_en: "", body_es: [], body_en: [] }),
  },
  {
    type: "dividerBlock",
    label: "Divisor",
    hint: "Separador (línea, punto o espacio)",
    category: "layout",
    factory: () => ({ _type: "dividerBlock", _key: k(), style: "rule" }),
  },
  {
    type: "ctaBlock",
    label: "Llamado a acción",
    hint: "1–2 botones de acción",
    category: "interactive",
    factory: () => ({ _type: "ctaBlock", _key: k(), label: "", href: "", secondaryLabel: "", secondaryHref: "" }),
  },

  /* ── Data ────────────────────────────────────────────────────────── */
  {
    type: "pillarsBlock",
    label: "Pilares",
    hint: "Lista de pilares/valores con copy bilingüe",
    category: "data",
    factory: () => ({ _type: "pillarsBlock", _key: k(), kicker: "", pillars: [] }),
  },
  {
    type: "timelineBlock",
    label: "Línea de tiempo",
    hint: "Entradas con año, etiqueta y nota bilingüe",
    category: "data",
    factory: () => ({ _type: "timelineBlock", _key: k(), title: "", entries: [] }),
  },
  {
    type: "statsBlock",
    label: "Stats",
    hint: "Cifras destacadas con etiqueta",
    category: "data",
    factory: () => ({ _type: "statsBlock", _key: k(), title: "", stats: [] }),
  },
  {
    type: "featuredCardsBlock",
    label: "Cards destacadas",
    hint: "Tarjetas con título, descripción, imagen y enlace",
    category: "data",
    factory: () => ({ _type: "featuredCardsBlock", _key: k(), title: "", cards: [] }),
  },
  {
    type: "recipeBlock",
    label: "Receta",
    hint: "Receta estructurada (ingredientes + pasos)",
    category: "data",
    factory: () => ({ _type: "recipeBlock", _key: k(), title: "", meta: { time: undefined, servings: undefined, difficulty: "" }, ingredients: [], steps: [] }),
  },

  /* ── Interactive ─────────────────────────────────────────────────── */
  {
    type: "accordionBlock",
    label: "Acordeón",
    hint: "Preguntas y respuestas plegables (FAQ)",
    category: "interactive",
    factory: () => ({ _type: "accordionBlock", _key: k(), title: "", items: [] }),
  },
  {
    type: "mapBlock",
    label: "Mapa",
    hint: "Ubicación con dirección y enlace a Maps",
    category: "interactive",
    factory: () => ({ _type: "mapBlock", _key: k(), title: "", address: "", lat: undefined, lng: undefined, zoom: 14, mapsUrl: "" }),
  },
  {
    type: "codeBlock",
    label: "Código",
    hint: "Bloque de código con resaltado",
    category: "interactive",
    factory: () => ({ _type: "codeBlock", _key: k(), language: "", caption: "", code: "" }),
  },
];

export const BLOCK_BY_TYPE: Record<string, BlockMeta> = Object.fromEntries(
  BLOCKS.map((b) => [b.type, b]),
);

export const BLOCKS_BY_CATEGORY: Record<BlockCategory, BlockMeta[]> = {
  text: BLOCKS.filter((b) => b.category === "text"),
  media: BLOCKS.filter((b) => b.category === "media"),
  layout: BLOCKS.filter((b) => b.category === "layout"),
  data: BLOCKS.filter((b) => b.category === "data"),
  interactive: BLOCKS.filter((b) => b.category === "interactive"),
};

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  text: "Texto",
  media: "Medios",
  layout: "Estructura",
  data: "Datos",
  interactive: "Interactivos",
};

export function newKey(): string {
  return uuid();
}
