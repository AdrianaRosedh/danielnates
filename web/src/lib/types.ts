/**
 * Supabase row types — single source of truth for all content.
 *
 * Convention: snake_case columns, paired _es/_en for bilingual fields,
 * jsonb columns typed as object/array shapes.
 */
import type { PortableTextBlock } from "@portabletext/types";

export type Locale = "es" | "en";

/* ── Shared shapes ────────────────────────────────────────────────── */

export interface VoiceTrack {
  es?: string | null;
  en?: string | null;
  caption?: string | null;
}

export interface Pillar {
  label: string;
  copy_es?: string | null;
  copy_en?: string | null;
}

export interface Social {
  olivea_instagram?: string | null;
  fritanguita_instagram?: string | null;
  email?: string | null;
}

/* ── Page-builder blocks ──────────────────────────────────────────── */
/* Block shapes are stored as jsonb. Keys are camelCase to match the
   public block renderer's switch on `_type`. Image fields hold direct
   URL strings (uploaded to Supabase Storage). */

export type BlockTone = "cinematic" | "clean" | "marquee";
export type LayoutWidth = "inline" | "full" | "bleed";
export type ReadWidth = "comfort" | "editorial" | "full";
export type GalleryLayout = "grid" | "strip" | "masonry";
export type DividerStyle = "rule" | "dot" | "space";
export type EmbedAspect = "16x9" | "9x16" | "1x1" | "4x5";
export type QuoteTone = "editorial" | "pull";
export type MarqueeSpeed = "slow" | "medium" | "fast";

export interface HeroBlock { _type: "heroBlock"; _key: string; eyebrow?: string; title?: string; subtitle?: string; image_url?: string | null; videoUrl?: string; tone?: BlockTone; }
export interface RichTextBlock { _type: "richTextBlock"; _key: string; body?: PortableTextBlock[]; maxWidth?: ReadWidth; }
export interface ImageBlockData { _type: "imageBlock"; _key: string; image_url?: string | null; caption?: string; alt?: string; layout?: LayoutWidth; }
export interface GalleryBlock { _type: "galleryBlock"; _key: string; images?: { url: string; caption?: string; alt?: string }[]; layout?: GalleryLayout; caption?: string; }
export interface VideoBlock { _type: "videoBlock"; _key: string; videoUrl?: string; poster_url?: string | null; caption?: string; autoplay?: boolean; loop?: boolean; layout?: LayoutWidth; }
export interface QuoteBlock { _type: "quoteBlock"; _key: string; text?: string; attribution?: string; tone?: QuoteTone; }
export interface DividerBlock { _type: "dividerBlock"; _key: string; style?: DividerStyle; }
export interface EmbedBlock { _type: "embedBlock"; _key: string; url?: string; caption?: string; aspect?: EmbedAspect; }
export interface CtaBlock { _type: "ctaBlock"; _key: string; label?: string; href?: string; secondaryLabel?: string; secondaryHref?: string; }
export interface MarqueeBlock { _type: "marqueeBlock"; _key: string; text?: string; speed?: MarqueeSpeed; }
export interface RecipeBlock { _type: "recipeBlock"; _key: string; title?: string; meta?: { time?: number; servings?: number; difficulty?: string }; ingredients?: { amount?: string; item: string; note?: string }[]; steps?: PortableTextBlock[]; }
export interface AudioBlock { _type: "audioBlock"; _key: string; audioUrl?: string; title?: string; caption?: string; transcript?: string; }
export interface PillarsBlock { _type: "pillarsBlock"; _key: string; kicker?: string; pillars?: Pillar[]; }
export interface SplitBlock { _type: "splitBlock"; _key: string; orientation?: "media-left" | "media-right"; image_url?: string | null; videoUrl?: string; eyebrow?: string; heading_es?: string; heading_en?: string; body_es?: PortableTextBlock[]; body_en?: PortableTextBlock[]; }
export interface TimelineBlock { _type: "timelineBlock"; _key: string; title?: string; entries?: { year: string; label: string; note_es?: string; note_en?: string }[]; }
export interface AccordionBlock { _type: "accordionBlock"; _key: string; title?: string; items?: { q_es?: string; q_en?: string; a_es?: PortableTextBlock[]; a_en?: PortableTextBlock[] }[]; }
export interface FeaturedCardsBlock { _type: "featuredCardsBlock"; _key: string; title?: string; cards?: { title: string; description?: string; image_url?: string | null; href?: string; tag?: string }[]; }
export interface MapBlock { _type: "mapBlock"; _key: string; title?: string; address?: string; lat?: number; lng?: number; zoom?: number; mapsUrl?: string; }
export interface StatsBlock { _type: "statsBlock"; _key: string; title?: string; stats?: { value: string; label: string; note?: string }[]; }
export interface CodeBlock { _type: "codeBlock"; _key: string; language?: string; caption?: string; code?: string; }

export type PageBlock =
  | HeroBlock | RichTextBlock | ImageBlockData | GalleryBlock | VideoBlock
  | QuoteBlock | DividerBlock | EmbedBlock | CtaBlock | MarqueeBlock
  | RecipeBlock | AudioBlock | PillarsBlock | SplitBlock | TimelineBlock
  | AccordionBlock | FeaturedCardsBlock | MapBlock | StatsBlock | CodeBlock;

/* ── Documents ────────────────────────────────────────────────────── */

export interface SiteSettings {
  id: string;
  site_name: string | null;
  description_es: string | null;
  description_en: string | null;
  default_og_url: string | null;
  navigation: { label: string; href: string }[] | null;
  footer: { note_es?: string; note_en?: string; links?: { label?: string; href?: string }[] } | null;
}

export interface Person {
  id: string;
  name: string | null;
  tagline_es: string | null;
  tagline_en: string | null;
  subline_es: string | null;
  subline_en: string | null;
  portrait_url: string | null;
  bio_short_es: string | null;
  bio_short_en: string | null;
  bio_long_es: PortableTextBlock[] | null;
  bio_long_en: PortableTextBlock[] | null;
  pillars: Pillar[] | null;
  voice: VoiceTrack | null;
  social: Social | null;
}

export interface PressRecognition {
  year: string;
  label: string;
  org?: string;
  url?: string;
}

export interface PressMention {
  outlet: string;
  title?: string | null;
  url: string;
  date?: string | null;
  language?: "es" | "en" | null;
}

export interface PressPhoto {
  url: string;
  caption?: string | null;
  credit?: string | null;
}

export interface PressKit {
  id: string;
  bio_one_line_es: string | null;
  bio_one_line_en: string | null;
  bio_short_es: string | null;
  bio_short_en: string | null;
  bio_long_es: PortableTextBlock[] | null;
  bio_long_en: PortableTextBlock[] | null;
  photos: PressPhoto[] | null;
  recognitions: PressRecognition[] | null;
  mentions: PressMention[] | null;
  press_pdf_url: string | null;
  press_email: string | null;
}

export type ProjectStatus = "primary" | "secondary" | "past";

/** Per-project editorial framing shown above the hero on the detail page. */
export interface ProjectFraming {
  kicker_es?: string | null;
  kicker_en?: string | null;
  intro_es?: string | null;
  intro_en?: string | null;
  meta_es?: string | null;
  meta_en?: string | null;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus | null;
  summary_es: string | null;
  summary_en: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  body_es: PortableTextBlock[] | null;
  body_en: PortableTextBlock[] | null;
  blocks: PageBlock[] | null;
  links: { label: string; href: string }[] | null;
  voice: VoiceTrack | null;
  framing: ProjectFraming | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt_es: string | null;
  excerpt_en: string | null;
  cover_url: string | null;
  tags: string[] | null;
  body_es: PortableTextBlock[] | null;
  body_en: PortableTextBlock[] | null;
  voice: VoiceTrack | null;
  blocks: PageBlock[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ArtPiece {
  id: string;
  slug: string;
  title: string;
  cover_url: string | null;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  statement_es: string | null;
  statement_en: string | null;
  voice: VoiceTrack | null;
  blocks: PageBlock[] | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailyBrief {
  id: string;
  date: string;
  image_url: string | null;
  line_es: string | null;
  line_en: string | null;
  place: string | null;
  voice: VoiceTrack | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type FieldNoteCategory = "ingredient" | "territory" | "technique" | "influence";

export interface FieldNote {
  id: string;
  title: string;
  date: string;
  category: FieldNoteCategory | null;
  body_es: PortableTextBlock[] | null;
  body_en: PortableTextBlock[] | null;
  external_link: string | null;
  published: boolean;
}
