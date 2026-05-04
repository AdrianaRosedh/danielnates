import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const title = String(body.title ?? "").trim();
  const slug = String(body.slug ?? "").trim();
  if (!title) return new Response("Title is required", { status: 400 });
  if (!slug) return new Response("Slug is required", { status: 400 });

  const insert = {
    title,
    slug,
    status: ((body.status as string | null) ?? "secondary"),
    summary_es: (body.summary_es as string | null) ?? null,
    summary_en: (body.summary_en as string | null) ?? null,
    hero_image_url: (body.hero_image_url as string | null) ?? null,
    hero_video_url: (body.hero_video_url as string | null) ?? null,
    blocks: Array.isArray(body.blocks) ? body.blocks : [],
    links: Array.isArray(body.links) ? body.links : [],
    voice: (body.voice && typeof body.voice === "object") ? body.voice : null,
    published: Boolean(body.published ?? false),
  };

  const { data, error } = await auth.supabase
    .from("projects")
    .insert(insert)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk(data, 201);
};
