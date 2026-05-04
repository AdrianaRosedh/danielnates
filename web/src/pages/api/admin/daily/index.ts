import type { APIRoute } from "astro";
import { getSupabaseFromRequest, getUserFromRequest } from "../../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getUserFromRequest(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = getSupabaseFromRequest(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const insert = {
    date: String(body.date ?? new Date().toISOString().slice(0, 10)),
    image_url: (body.image_url as string | null) ?? null,
    line_es: (body.line_es as string | null) ?? null,
    line_en: (body.line_en as string | null) ?? null,
    place: (body.place as string | null) ?? null,
    voice: (body.voice as Record<string, unknown> | null) ?? null,
    published: Boolean(body.published ?? true),
  };

  const { data, error } = await supabase
    .from("daily_briefs")
    .insert(insert)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "content-type": "application/json" },
  });
};
