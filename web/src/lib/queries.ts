/**
 * Public-page data fetchers — all backed by Supabase.
 *
 * Convention:
 *   - All getters return null / [] gracefully if Supabase isn't configured
 *     (so the build works in CI without env vars set).
 *   - Public reads use the anon client; RLS limits SELECT to published rows.
 */
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
import { getSupabase } from "./supabase";

const ARTICLE_COLS = "id, slug, title, date, excerpt_es, excerpt_en, cover_url, tags, body_es, body_en, voice, blocks, published, created_at, updated_at";
const PROJECT_COLS = "id, slug, title, status, summary_es, summary_en, hero_image_url, hero_video_url, body_es, body_en, blocks, links, voice, framing, published, created_at, updated_at";
const ART_COLS = "id, slug, title, cover_url, year, medium, dimensions, statement_es, statement_en, voice, blocks, published, created_at, updated_at";
const BRIEF_COLS = "id, date, image_url, line_es, line_en, place, voice, published, created_at, updated_at";

/* ── Singletons ───────────────────────────────────────────────────── */

export async function getDaniel(): Promise<Person | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("person").select("*").eq("id", "daniel").maybeSingle();
  return (data ?? null) as Person | null;
}

export async function getPressKit(): Promise<PressKit | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("press_kit").select("*").eq("id", "singleton").maybeSingle();
  return (data ?? null) as PressKit | null;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle();
  return (data ?? null) as SiteSettings | null;
}

/* ── Projects ─────────────────────────────────────────────────────── */

export async function getProjects(): Promise<Project[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("projects")
    .select(PROJECT_COLS)
    .eq("published", true)
    .order("status", { ascending: true });
  return ((data ?? []) as Project[]).sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
}

export async function getProject(slug: string): Promise<Project | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("projects")
    .select(PROJECT_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data ?? null) as Project | null;
}

function statusOrder(s: Project["status"]): number {
  if (s === "primary") return 0;
  if (s === "secondary") return 1;
  if (s === "past") return 2;
  return 3;
}

/* ── Articles ─────────────────────────────────────────────────────── */

export async function getArticles(): Promise<Article[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("published", true)
    .order("date", { ascending: false });
  return (data ?? []) as Article[];
}

export async function getLatestArticles(limit = 3): Promise<Article[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("published", true)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []) as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("articles")
    .select(ARTICLE_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data ?? null) as Article | null;
}

/* ── Art ──────────────────────────────────────────────────────────── */

export async function getArtPieces(): Promise<ArtPiece[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("art_pieces")
    .select(ART_COLS)
    .eq("published", true)
    .order("year", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  return (data ?? []) as ArtPiece[];
}

export async function getArtPiece(slug: string): Promise<ArtPiece | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("art_pieces")
    .select(ART_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data ?? null) as ArtPiece | null;
}

/* ── Daily Brief ──────────────────────────────────────────────────── */

export async function getDailyBriefs(limit = 120): Promise<DailyBrief[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("daily_briefs")
    .select(BRIEF_COLS)
    .eq("published", true)
    .order("date", { ascending: false })
    .limit(limit);
  return (data ?? []) as DailyBrief[];
}

export async function getLatestDailyBrief(): Promise<DailyBrief | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data } = await sb
    .from("daily_briefs")
    .select(BRIEF_COLS)
    .eq("published", true)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as DailyBrief | null;
}

/* ── Field Notes ──────────────────────────────────────────────────── */

export async function getFieldNotes(): Promise<FieldNote[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("field_notes")
    .select("*")
    .eq("published", true)
    .order("date", { ascending: false });
  return (data ?? []) as FieldNote[];
}

/* ── Press Mentions ───────────────────────────────────────────────── */

export async function getPressMentions(): Promise<import("./types").PressMention[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data } = await sb
    .from("press_mentions")
    .select("outlet, title, url, date, language")
    .order("date", { ascending: false, nullsFirst: false })
    .limit(500);
  return (data ?? []) as import("./types").PressMention[];
}
