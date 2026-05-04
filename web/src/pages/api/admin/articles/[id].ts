import type { APIRoute } from "astro";
import { jsonOk, requireAdmin, textToBlocks } from "../../../../lib/admin-helpers";

export const prerender = false;

const SCALARS = ["title", "slug", "date", "cover_url", "excerpt_es", "excerpt_en", "tags", "voice", "blocks", "published"] as const;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const id = params.id as string;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const k of SCALARS) {
    if (k in body) patch[k] = body[k];
  }
  // Treat textareas as plain text → blocks
  if ("body_es" in body) patch.body_es = textToBlocks(body.body_es as string | null);
  if ("body_en" in body) patch.body_en = textToBlocks(body.body_en as string | null);

  const { data, error } = await auth.supabase
    .from("articles")
    .update(patch)
    .eq("id", id)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return new Response("Slug already exists", { status: 409 });
    return new Response(error.message, { status: 400 });
  }
  return jsonOk(data);
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const { error } = await auth.supabase
    .from("articles")
    .delete()
    .eq("id", params.id as string);

  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 204 });
};
