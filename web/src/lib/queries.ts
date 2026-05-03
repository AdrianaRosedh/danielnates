import type { SanityClient } from "@sanity/client";
import type { AstroCookies } from "astro";
import type {
  Article,
  ArtPiece,
  DailyBrief,
  FieldNote,
  Person,
  PressKit,
  Project,
  SiteSettings,
} from "./types";
import { sanity, getSanity, DRAFT_COOKIE } from "./sanity";

/** Use this from inside an Astro page. Picks the draft client if the cookie is set. */
export function clientFor(cookies?: AstroCookies): SanityClient {
  if (!cookies) return sanity;
  return getSanity(cookies.get(DRAFT_COOKIE)?.value);
}

/* ── Inline GROQ fragment for the page-builder shape ───────────────── */
const blocksProjection = `
  blocks[]{
    _key,
    _type,
    // shared / repeated keys are flattened — Sanity returns whichever exist
    eyebrow, title, subtitle, image, videoUrl, tone,
    body, maxWidth,
    caption, alt, layout,
    images[]{..., asset->{...}},
    poster, autoplay, loop,
    text, attribution,
    style,
    url, aspect,
    label, href, secondaryLabel, secondaryHref,
    speed,
    // recipe
    meta, ingredients, steps,
    // audio
    audioUrl, transcript,
    // pillars
    kicker, pillars,
    // split
    orientation, heading,
    // timeline / accordion / featuredCards / stats
    entries, items, cards, stats,
    // map
    address, lat, lng, zoom, mapsUrl,
    // code
    language, code
  }
`;

/* ── Site / Person ─────────────────────────────────────────────────── */
export const SITE_SETTINGS_QUERY = `
*[_type == "siteSettings"][0]{
  siteName,
  description,
  defaultOg,
  navigation[],
  footer
}`;

export const PRESS_KIT_QUERY = `
*[_type == "pressKit"][0]{
  bioOneLine,
  bioShort,
  bioLong,
  photos[]{..., asset->{...}},
  recognitions,
  mentions,
  "pressPdf": pressPdf{asset->{url}},
  pressEmail
}`;

export const DANIEL_QUERY = `
*[_type == "person"] | order(_updatedAt desc)[0]{
  _id,
  name,
  tagline,
  subline,
  portrait,
  bioShort,
  bioLong,
  pillars,
  voice,
  social
}`;

/* ── Projects ──────────────────────────────────────────────────────── */
export const PROJECTS_QUERY = `
*[_type == "project"] | order(
  select(
    status == "primary" => 0,
    status == "secondary" => 1,
    status == "past" => 2,
    3
  ) asc
){
  _id,
  title,
  slug,
  status,
  summary,
  heroMedia,
  links
}`;

export const PROJECT_BY_SLUG = `
*[_type == "project" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  status,
  summary,
  body,
  links,
  heroMedia,
  voice,
  ${blocksProjection}
}`;

export const PROJECT_SLUGS_QUERY = `*[_type == "project" && defined(slug.current)].slug.current`;

/* ── Articles ──────────────────────────────────────────────────────── */
export const ARTICLES_QUERY = `
*[_type == "article"] | order(date desc){
  _id,
  title,
  slug,
  date,
  excerpt,
  cover,
  tags
}`;

export const LATEST_ARTICLES_QUERY = `
*[_type == "article"] | order(date desc)[0...$limit]{
  _id,
  title,
  slug,
  date,
  excerpt,
  cover
}`;

export const ARTICLE_BY_SLUG = `
*[_type == "article" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  date,
  excerpt,
  cover,
  tags,
  voice,
  ${blocksProjection}
}`;

export const ARTICLE_SLUGS_QUERY = `*[_type == "article" && defined(slug.current)].slug.current`;

/* ── Art ───────────────────────────────────────────────────────────── */
export const ART_PIECES_QUERY = `
*[_type == "artPiece"] | order(year desc, _createdAt desc){
  _id,
  title,
  slug,
  cover,
  year,
  medium
}`;

export const ART_PIECE_BY_SLUG = `
*[_type == "artPiece" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  cover,
  year,
  medium,
  dimensions,
  statement,
  voice,
  ${blocksProjection}
}`;

export const ART_SLUGS_QUERY = `*[_type == "artPiece" && defined(slug.current)].slug.current`;

/* ── Daily Brief ───────────────────────────────────────────────────── */
export const DAILY_BRIEFS_QUERY = `
*[_type == "dailyBrief"] | order(date desc){
  _id,
  date,
  image,
  line,
  place,
  voice
}`;

export const LATEST_DAILY_BRIEF_QUERY = `
*[_type == "dailyBrief"] | order(date desc)[0]{
  _id,
  date,
  image,
  line,
  place,
  voice
}`;

/* ── Field Notes ───────────────────────────────────────────────────── */
export const FIELD_NOTES_QUERY = `
*[_type == "fieldNote"] | order(date desc){
  title,
  date,
  category,
  body,
  externalLink
}`;

/* ── Typed helpers (accept optional client; default to published) ──── */
type C = SanityClient | undefined;
const C = (c?: C) => c ?? sanity;

export const getSiteSettings = (c?: C) =>
  C(c).fetch<SiteSettings | null>(SITE_SETTINGS_QUERY);
export const getPressKit = (c?: C) =>
  C(c).fetch<PressKit | null>(PRESS_KIT_QUERY);
export const getDaniel = (c?: C) => C(c).fetch<Person | null>(DANIEL_QUERY);

export const getProjects = (c?: C) => C(c).fetch<Project[]>(PROJECTS_QUERY);
export const getProject = (slug: string, c?: C) =>
  C(c).fetch<Project | null>(PROJECT_BY_SLUG, { slug });
export const getProjectSlugs = (c?: C) => C(c).fetch<string[]>(PROJECT_SLUGS_QUERY);

export const getArticles = (c?: C) => C(c).fetch<Article[]>(ARTICLES_QUERY);
export const getLatestArticles = (limit = 3, c?: C) =>
  C(c).fetch<Article[]>(LATEST_ARTICLES_QUERY, { limit });
export const getArticle = (slug: string, c?: C) =>
  C(c).fetch<Article | null>(ARTICLE_BY_SLUG, { slug });
export const getArticleSlugs = (c?: C) => C(c).fetch<string[]>(ARTICLE_SLUGS_QUERY);

export const getArtPieces = (c?: C) => C(c).fetch<ArtPiece[]>(ART_PIECES_QUERY);
export const getArtPiece = (slug: string, c?: C) =>
  C(c).fetch<ArtPiece | null>(ART_PIECE_BY_SLUG, { slug });
export const getArtSlugs = (c?: C) => C(c).fetch<string[]>(ART_SLUGS_QUERY);

export const getFieldNotes = (c?: C) => C(c).fetch<FieldNote[]>(FIELD_NOTES_QUERY);

export const getDailyBriefs = (c?: C) =>
  C(c).fetch<DailyBrief[]>(DAILY_BRIEFS_QUERY);
export const getLatestDailyBrief = (c?: C) =>
  C(c).fetch<DailyBrief | null>(LATEST_DAILY_BRIEF_QUERY);
