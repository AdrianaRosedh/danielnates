import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  if (!title || !slug) return new Response("Title and slug are required", { status: 400 });

  const insert = {
    title,
    slug,
    cover_url: (body.cover_url as string | null) ?? null,
    year: typeof body.year === "number" ? body.year : null,
    medium: (body.medium as string | null) ?? null,
    dimensions: (body.dimensions as string | null) ?? null,
    statement_es: (body.statement_es as string | null) ?? null,
    statement_en: (body.statement_en as string | null) ?? null,
    voice: (body.voice as Record<string, unknown> | null) ?? null,
    blocks: (body.blocks as unknown[] | null) ?? null,
    published: Boolean(body.published ?? false),
  };

  const { data, error } = await auth.supabase
    .from("art_pieces")
    .insert(insert)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return new Response("Slug already exists", { status: 409 });
    return new Response(error.message, { status: 400 });
  }
  return jsonOk(data, 201);
};
