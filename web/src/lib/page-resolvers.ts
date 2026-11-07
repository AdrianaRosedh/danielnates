/**
 * Detail-page resolution, shared by the Spanish pages and their thin
 * English wrappers (src/pages/en/**), which render the Spanish page as
 * a child component. A child component cannot redirect or rewrite — a
 * missing English slug used to render a blank 200 — so every page-level
 * route calls these resolvers itself and returns `notFound` when needed.
 *
 * Lookups are memoized per request (queries + draft lookups), so the
 * wrapper and the page it renders share one round-trip.
 */
import type { AstroGlobal } from "astro";
import type { Article, ArtPiece, Locale, Project } from "./types";
import { getArticle, getArtPiece, getProject } from "./queries";
import { getSupabaseServer } from "./supabase";
import { memo } from "./request-cache";

/** Only real slugs reach the database — bots probing /favicon.ico,
 *  /wp-login.php, /.env … get the 404 without a query. */
export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;

/** Top-level paths owned by other routes — never project slugs. */
const RESERVED_PROJECT_SLUGS = new Set([
  "en", "diario", "arte", "contacto", "contact", "api", "404", "admin", "sobre",
  "prensa", "press", "dia", "day", "og.png", "proyectos", "projects", "editar",
]);

export const notFoundPath = (locale: Locale) => (locale === "en" ? "/en/404" : "/404");

type PageCtx = Pick<AstroGlobal, "params" | "cookies" | "locals" | "rewrite">;
type Resolved<K extends string, T> = { [P in K]: T } | { notFound: Promise<Response> };

/** Published row, or — for signed-in editors — the draft, so "+ Nuevo"
 *  can land on a page that isn't public yet. */
async function publishedOrDraft<T>(
  ctx: PageCtx,
  table: "projects" | "articles" | "art_pieces",
  slug: string,
  getPublished: (slug: string) => Promise<T | null>,
): Promise<T | null> {
  const published = await getPublished(slug);
  if (published || !ctx.locals.isAdmin) return published;
  return memo(`draft:${table}:${slug}`, async () => {
    const sb = getSupabaseServer(ctx.cookies);
    if (!sb) return null;
    const { data, error } = await sb.from(table).select("*").eq("slug", slug).maybeSingle();
    if (error) console.error(`[resolver] draft ${table}/${slug}:`, error.message);
    return (data ?? null) as T | null;
  });
}

function slugOf(ctx: PageCtx): string {
  return String(ctx.params.slug ?? "");
}

export async function resolveProjectPage(ctx: PageCtx, locale: Locale): Promise<Resolved<"project", Project>> {
  const slug = slugOf(ctx);
  const project =
    SLUG_RE.test(slug) && !RESERVED_PROJECT_SLUGS.has(slug)
      ? await publishedOrDraft<Project>(ctx, "projects", slug, getProject)
      : null;
  return project ? { project } : { notFound: ctx.rewrite(notFoundPath(locale)) };
}

export async function resolveArticlePage(ctx: PageCtx, locale: Locale): Promise<Resolved<"article", Article>> {
  const slug = slugOf(ctx);
  const article = SLUG_RE.test(slug) ? await publishedOrDraft<Article>(ctx, "articles", slug, getArticle) : null;
  return article ? { article } : { notFound: ctx.rewrite(notFoundPath(locale)) };
}

export async function resolveArtPiecePage(ctx: PageCtx, locale: Locale): Promise<Resolved<"piece", ArtPiece>> {
  const slug = slugOf(ctx);
  const piece = SLUG_RE.test(slug) ? await publishedOrDraft<ArtPiece>(ctx, "art_pieces", slug, getArtPiece) : null;
  return piece ? { piece } : { notFound: ctx.rewrite(notFoundPath(locale)) };
}
