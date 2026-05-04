import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

const SCALARS = [
  "title", "slug", "status",
  "summary_es", "summary_en",
  "hero_image_url", "hero_video_url",
  "published",
] as const;

const JSON_FIELDS = ["blocks", "links", "voice", "framing"] as const;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const id = params.id as string;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const k of SCALARS) {
    if (k in body) patch[k] = body[k];
  }
  for (const k of JSON_FIELDS) {
    if (k in body) patch[k] = body[k];
  }

  const { data, error } = await auth.supabase
    .from("projects")
    .update(patch)
    .eq("id", id)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk(data);
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const { error } = await auth.supabase
    .from("projects")
    .delete()
    .eq("id", params.id as string);

  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 204 });
};
