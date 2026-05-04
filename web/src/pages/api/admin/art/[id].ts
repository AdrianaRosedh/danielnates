import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

const FIELDS = [
  "title", "slug", "cover_url",
  "year", "medium", "dimensions",
  "statement_es", "statement_en",
  "voice", "blocks", "published",
] as const;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const id = params.id as string;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const k of FIELDS) {
    if (k in body) patch[k] = body[k];
  }

  const { data, error } = await auth.supabase
    .from("art_pieces")
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
    .from("art_pieces")
    .delete()
    .eq("id", params.id as string);

  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 204 });
};
