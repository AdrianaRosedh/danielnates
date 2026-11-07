/**
 * Public-page data fetchers — all backed by Supabase.
 *
 * Convention:
 *   - Every getter degrades gracefully (null / [] / {}) when Supabase is
 *     unconfigured, slow or failing — the page renders its defaults.
 *   - Failures are logged server-side with the query label; they are
 *     never silent (a missing column once emptied every article page).
 *   - Public reads use the shared anon client; RLS limits SELECT to
 *     published rows.
 *   - Reads are memoized per request (see request-cache): the layout,
 *     menu and page share one round-trip per query.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Article,
  ArtPiece,
  DailyBrief,
  Person,
  PressKit,
  PressMention,
  Project,
  SiteSettings,
} from "./types";
import { getSupabase } from "./supabase";
import { memo } from "./request-cache";

const ARTICLE_COLS = "id, slug, title, date, excerpt_es, excerpt_en, cover_url, tags, body_es, body_en, voice, blocks, published, created_at, updated_at";
const PROJECT_COLS = "id, slug, title, status, summary_es, summary_en, hero_image_url, hero_video_url, body_es, body_en, blocks, links, voice, framing, published, created_at, updated_at";
const ART_COLS = "id, slug, title, cover_url, year, medium, dimensions, statement_es, statement_en, voice, blocks, published, created_at, updated_at";
const BRIEF_COLS = "id, date, image_url, line_es, line_en, place, voice, published, created_at, updated_at";
const MENTION_COLS = "id, outlet, title, url, date, language";

type QueryResult = { data: unknown; error: { message: string } | null };

/** Runs one read with logging + graceful fallback, memoized per request. */
function read<T>(
  key: string,
  run: (sb: SupabaseClient) => PromiseLike<QueryResult>,
  fallback: T,
): Promise<T> {
  return memo(key, async () => {
    const sb = getSupabase();
    if (!sb) return fallback;
    try {
      const { data, error } = await run(sb);
      if (error) {
        console.error(`[queries] ${key} failed:`, error.message);
        return fallback;
      }
      return (data ?? fallback) as T;
    } catch (err) {
      console.error(`[queries] ${key} threw:`, err instanceof Error ? err.message : err);
      return fallback;
    }
  });
}

/* ── Singletons ───────────────────────────────────────────────────── */

export const getDaniel = () =>
  read<Person | null>("person:daniel", (sb) => sb.from("person").select("*").eq("id", "daniel").maybeSingle(), null);

export const getPressKit = () =>
  read<PressKit | null>("press_kit", (sb) => sb.from("press_kit").select("*").eq("id", "singleton").maybeSingle(), null);

export const getSiteSettings = () =>
  read<SiteSettings | null>("site_settings", (sb) => sb.from("site_settings").select("*").eq("id", "singleton").maybeSingle(), null);

/* ── Landing copy (key/value editorial strings) ───────────────────── */

/** landing_copy as a flat lookup; callers fall back to their own
 *  defaults for any missing key. */
export async function getLandingCopy(): Promise<Record<string, string>> {
  const rows = await read<{ key: string; value: string | null }[]>(
    "landing_copy",
    (sb) => sb.from("landing_copy").select("key, value"),
    [],
  );
  const out: Record<string, string> = {};
  for (const row of rows) if (row?.key && row.value != null) out[row.key] = row.value;
  return out;
}

/* ── Projects ─────────────────────────────────────────────────────── */

function statusOrder(s: Project["status"]): number {
  if (s === "primary") return 0;
  if (s === "secondary") return 1;
  if (s === "past") return 2;
  return 3;
}

export async function getProjects(): Promise<Project[]> {
  const rows = await read<Project[]>(
    "projects",
    (sb) => sb.from("projects").select(PROJECT_COLS).eq("published", true).order("status", { ascending: true }),
    [],
  );
  return [...rows].sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
}

export const getProject = (slug: string) =>
  read<Project | null>(
    `project:${slug}`,
    (sb) => sb.from("projects").select(PROJECT_COLS).eq("slug", slug).eq("published", true).maybeSingle(),
    null,
  );

/* ── Articles ─────────────────────────────────────────────────────── */

export const getArticles = () =>
  read<Article[]>(
    "articles",
    (sb) => sb.from("articles").select(ARTICLE_COLS).eq("published", true).order("date", { ascending: false }),
    [],
  );

export const getLatestArticles = (limit = 3) =>
  read<Article[]>(
    `articles:latest:${limit}`,
    (sb) => sb.from("articles").select(ARTICLE_COLS).eq("published", true).order("date", { ascending: false }).limit(limit),
    [],
  );

export const getArticle = (slug: string) =>
  read<Article | null>(
    `article:${slug}`,
    (sb) => sb.from("articles").select(ARTICLE_COLS).eq("slug", slug).eq("published", true).maybeSingle(),
    null,
  );

/* ── Art ──────────────────────────────────────────────────────────── */

export const getArtPieces = () =>
  read<ArtPiece[]>(
    "art_pieces",
    (sb) =>
      sb
        .from("art_pieces")
        .select(ART_COLS)
        .eq("published", true)
        .order("year", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false }),
    [],
  );

export const getArtPiece = (slug: string) =>
  read<ArtPiece | null>(
    `art_piece:${slug}`,
    (sb) => sb.from("art_pieces").select(ART_COLS).eq("slug", slug).eq("published", true).maybeSingle(),
    null,
  );

/* ── Daily Brief ──────────────────────────────────────────────────── */

export const getDailyBriefs = (limit = 120) =>
  read<DailyBrief[]>(
    `daily_briefs:${limit}`,
    (sb) => sb.from("daily_briefs").select(BRIEF_COLS).eq("published", true).order("date", { ascending: false }).limit(limit),
    [],
  );

export const getLatestDailyBrief = () =>
  read<DailyBrief | null>(
    "daily_briefs:latest",
    (sb) =>
      sb.from("daily_briefs").select(BRIEF_COLS).eq("published", true).order("date", { ascending: false }).limit(1).maybeSingle(),
    null,
  );

/* ── Press Mentions ───────────────────────────────────────────────── */

export const getPressMentions = () =>
  read<PressMention[]>(
    "press_mentions",
    (sb) => sb.from("press_mentions").select(MENTION_COLS).order("date", { ascending: false, nullsFirst: false }).limit(500),
    [],
  );
