import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

/**
 * Inline entity-create endpoint — used by the EditOverlay's
 * "+ Nuevo" button on list pages. Creates a minimal draft row
 * (published=false, generated slug, "Sin título" placeholder) and
 * returns the public URL the admin should be redirected to.
 *
 *   POST { entity }
 *     entity = "article" | "art" | "project" | "daily"
 *
 *   Response: { url: "/diario/nueva-<id>", slug, id }
 *
 * From there the admin edits the new row inline and toggles
 * "Publicado" when ready. Slug can be edited via the legacy form
 * (it's not yet in the inline-edit registry — slug rewrites are
 * destructive enough to need explicit confirmation).
 */

export const prerender = false;

type Entity = "article" | "art" | "project" | "daily";

/** A short, URL-safe, time-sorted unique stub. Daniel can rename
 *  it from the legacy form when ready. */
function genSlug(prefix: string): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${t}${r}`;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { entity?: string };
  const entity = (body.entity ?? "") as Entity;

  if (entity === "article") {
    const slug = genSlug("nueva");
    const row = {
      slug,
      title: "Nueva entrada",
      date: todayISO(),
      excerpt_es: null,
      excerpt_en: null,
      cover_url: null,
      tags: [],
      body_es: null,
      body_en: null,
      blocks: [],
      published: false,
    };
    const { data, error } = await auth.supabase
      .from("articles")
      .insert(row)
      .select("id, slug")
      .single();
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ url: `/diario/${data.slug}`, slug: data.slug, id: data.id });
  }

  if (entity === "art") {
    const slug = genSlug("pieza");
    const row = {
      slug,
      title: "Pieza nueva",
      year: new Date().getFullYear(),
      medium: null,
      dimensions: null,
      cover_url: null,
      statement_es: null,
      statement_en: null,
      blocks: [],
      published: false,
    };
    const { data, error } = await auth.supabase
      .from("art_pieces")
      .insert(row)
      .select("id, slug")
      .single();
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ url: `/arte/${data.slug}`, slug: data.slug, id: data.id });
  }

  if (entity === "project") {
    const slug = genSlug("proyecto");
    const row = {
      slug,
      title: "Proyecto nuevo",
      status: "secondary",
      summary_es: null,
      summary_en: null,
      hero_image_url: null,
      hero_video_url: null,
      blocks: [],
      links: [],
      voice: null,
      framing: {
        kicker_es: "Capítulo —",
        kicker_en: "Chapter —",
        intro_es: "",
        intro_en: "",
        meta_es: "",
        meta_en: "",
      },
      published: false,
    };
    const { data, error } = await auth.supabase
      .from("projects")
      .insert(row)
      .select("id, slug")
      .single();
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ url: `/${data.slug}`, slug: data.slug, id: data.id });
  }

  if (entity === "daily") {
    const row = {
      date: todayISO(),
      image_url: null,
      line_es: null,
      line_en: null,
      place: null,
      voice: null,
      published: false,
    };
    const { data, error } = await auth.supabase
      .from("daily_briefs")
      .insert(row)
      .select("id")
      .single();
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ url: `/dia#brief-${data.id}`, id: data.id });
  }

  return new Response(`Unknown entity: ${entity}`, { status: 400 });
};
