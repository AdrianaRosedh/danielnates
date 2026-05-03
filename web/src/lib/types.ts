import type { PortableTextBlock } from "@portabletext/types";

export type Locale = "es" | "en";

export interface BilingualText {
  es?: string;
  en?: string;
}

export interface VoiceTrack {
  es?: string;
  en?: string;
  caption?: string;
}

export interface BilingualBlocks {
  es?: PortableTextBlock[];
  en?: PortableTextBlock[];
}

export interface SanitySlug {
  current: string;
}

export interface SanityImage {
  _type: "image";
  asset?: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  alt?: string;
  caption?: string;
}

/* ── Page-builder blocks ───────────────────────────────────────────── */

export type BlockTone = "cinematic" | "clean" | "marquee";
export type LayoutWidth = "inline" | "full" | "bleed";
export type ReadWidth = "comfort" | "editorial" | "full";
export type GalleryLayout = "grid" | "strip" | "masonry";
export type DividerStyle = "rule" | "dot" | "space";
export type EmbedAspect = "16x9" | "9x16" | "1x1" | "4x5";
export type QuoteTone = "editorial" | "pull";
export type MarqueeSpeed = "slow" | "medium" | "fast";

export interface HeroBlock {
  _type: "heroBlock";
  _key: string;
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image?: SanityImage;
  videoUrl?: string;
  tone?: BlockTone;
}

export interface RichTextBlock {
  _type: "richTextBlock";
  _key: string;
  body?: PortableTextBlock[];
  maxWidth?: ReadWidth;
}

export interface ImageBlockData {
  _type: "imageBlock";
  _key: string;
  image?: SanityImage;
  caption?: string;
  alt?: string;
  layout?: LayoutWidth;
}

export interface GalleryBlock {
  _type: "galleryBlock";
  _key: string;
  images?: SanityImage[];
  layout?: GalleryLayout;
  caption?: string;
}

export interface VideoBlock {
  _type: "videoBlock";
  _key: string;
  videoUrl?: string;
  poster?: SanityImage;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
  layout?: LayoutWidth;
}

export interface QuoteBlock {
  _type: "quoteBlock";
  _key: string;
  text?: string;
  attribution?: string;
  tone?: QuoteTone;
}

export interface DividerBlock {
  _type: "dividerBlock";
  _key: string;
  style?: DividerStyle;
}

export interface EmbedBlock {
  _type: "embedBlock";
  _key: string;
  url?: string;
  caption?: string;
  aspect?: EmbedAspect;
}

export interface CtaBlock {
  _type: "ctaBlock";
  _key: string;
  label?: string;
  href?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export interface MarqueeBlock {
  _type: "marqueeBlock";
  _key: string;
  text?: string;
  speed?: MarqueeSpeed;
}

export interface RecipeBlock {
  _type: "recipeBlock";
  _key: string;
  title?: string;
  meta?: { time?: number; servings?: number; difficulty?: string };
  ingredients?: { amount?: string; item: string; note?: string }[];
  steps?: PortableTextBlock[];
}

export interface AudioBlock {
  _type: "audioBlock";
  _key: string;
  audioUrl?: string;
  title?: string;
  caption?: string;
  transcript?: string;
}

export interface PillarsBlock {
  _type: "pillarsBlock";
  _key: string;
  kicker?: string;
  pillars?: { label: string; copy?: BilingualText }[];
}

export interface SplitBlock {
  _type: "splitBlock";
  _key: string;
  orientation?: "media-left" | "media-right";
  image?: SanityImage;
  videoUrl?: string;
  eyebrow?: string;
  heading?: BilingualText;
  body?: BilingualBlocks;
}

export interface TimelineBlock {
  _type: "timelineBlock";
  _key: string;
  title?: string;
  entries?: { year: string; label: string; note?: BilingualText }[];
}

export interface AccordionBlock {
  _type: "accordionBlock";
  _key: string;
  title?: string;
  items?: { q: BilingualText; a?: BilingualBlocks }[];
}

export interface FeaturedCardsBlock {
  _type: "featuredCardsBlock";
  _key: string;
  title?: string;
  cards?: {
    title: string;
    description?: string;
    image?: SanityImage;
    href?: string;
    tag?: string;
  }[];
}

export interface MapBlock {
  _type: "mapBlock";
  _key: string;
  title?: string;
  address?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  mapsUrl?: string;
}

export interface StatsBlock {
  _type: "statsBlock";
  _key: string;
  title?: string;
  stats?: { value: string; label: string; note?: string }[];
}

export interface CodeBlock {
  _type: "codeBlock";
  _key: string;
  language?: string;
  caption?: string;
  code?: string;
}

export type PageBlock =
  | HeroBlock
  | RichTextBlock
  | ImageBlockData
  | GalleryBlock
  | VideoBlock
  | QuoteBlock
  | DividerBlock
  | EmbedBlock
  | CtaBlock
  | MarqueeBlock
  | RecipeBlock
  | AudioBlock
  | PillarsBlock
  | SplitBlock
  | TimelineBlock
  | AccordionBlock
  | FeaturedCardsBlock
  | MapBlock
  | StatsBlock
  | CodeBlock;

/* ── Documents ─────────────────────────────────────────────────────── */

export interface SiteSettings {
  siteName?: string;
  description?: BilingualText;
  defaultOg?: SanityImage;
  navigation?: { label: string; href: string }[];
  footer?: {
    note?: BilingualText;
    links?: { label?: string; href?: string }[];
  };
}

export interface PressRecognition {
  year: string;
  label: string;
  org?: string;
  url?: string;
}

export interface PressMention {
  outlet: string;
  title?: string;
  url: string;
  date?: string;
  language?: "es" | "en";
}

export interface PressPhoto extends SanityImage {
  caption?: string;
  credit?: string;
}

export interface PressKit {
  bioOneLine?: BilingualText;
  bioShort?: BilingualText;
  bioLong?: BilingualBlocks;
  photos?: PressPhoto[];
  recognitions?: PressRecognition[];
  mentions?: PressMention[];
  pressPdf?: { asset?: { url?: string } };
  pressEmail?: string;
}

export interface Pillar {
  label: string;
  copy?: BilingualText;
}

export interface Person {
  _id?: string;
  name?: string;
  tagline?: BilingualText;
  subline?: BilingualText;
  portrait?: SanityImage;
  bioShort?: BilingualText;
  bioLong?: BilingualBlocks;
  pillars?: Pillar[];
  voice?: VoiceTrack;
  social?: {
    oliveaInstagram?: string;
    fritanguitaInstagram?: string;
    email?: string;
  };
}

export type ProjectStatus = "primary" | "secondary" | "past";

export interface ProjectLink {
  label: string;
  href: string;
}

export interface HeroMedia {
  image?: SanityImage;
  videoUrl?: string;
}

export interface Project {
  _id?: string;
  title?: string;
  slug?: SanitySlug;
  status?: ProjectStatus;
  summary?: BilingualText;
  body?: BilingualBlocks;
  blocks?: PageBlock[];
  links?: ProjectLink[];
  heroMedia?: HeroMedia;
  voice?: VoiceTrack;
}

export interface Article {
  _id?: string;
  title?: string;
  slug?: SanitySlug;
  date?: string;
  excerpt?: BilingualText;
  cover?: SanityImage;
  tags?: string[];
  voice?: VoiceTrack;
  blocks?: PageBlock[];
}

export interface ArtPiece {
  _id?: string;
  title?: string;
  slug?: SanitySlug;
  cover?: SanityImage;
  year?: number;
  medium?: string;
  dimensions?: string;
  statement?: BilingualText;
  voice?: VoiceTrack;
  blocks?: PageBlock[];
}

export interface DailyBrief {
  _id?: string;
  date: string;
  image?: SanityImage;
  line?: BilingualText;
  place?: string;
  voice?: VoiceTrack;
}

export type FieldNoteCategory = "ingredient" | "territory" | "technique" | "influence";

export interface FieldNote {
  _id?: string;
  title?: string;
  date?: string;
  category?: FieldNoteCategory;
  body?: BilingualBlocks;
  externalLink?: string;
}
