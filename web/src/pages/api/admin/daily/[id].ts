import type { APIRoute } from "astro";
import { getSupabaseFromRequest, getUserFromRequest } from "../../../../lib/supabase";

export const prerender = false;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const user = await getUserFromRequest(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = getSupabaseFromRequest(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const id = params.id as string;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const k of ["date", "image_url", "line_es", "line_en", "place", "voice", "published"]) {
    if (k in body) patch[k] = body[k];
  }

  const { data, error } = await supabase
    .from("daily_briefs")
    .update(patch)
    .eq("id", id)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const user = await getUserFromRequest(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = getSupabaseFromRequest(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const { error } = await supabase
    .from("daily_briefs")
    .delete()
    .eq("id", params.id as string);

  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 204 });
};
