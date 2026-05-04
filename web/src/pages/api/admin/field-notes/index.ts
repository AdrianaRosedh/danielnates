import type { APIRoute } from "astro";
import { jsonOk, requireAdmin, textToBlocks } from "../../../../lib/admin-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const title = String(body.title ?? "").trim();
  if (!title) return new Response("Title is required", { status: 400 });

  const insert = {
    title,
    date: String(body.date ?? new Date().toISOString().slice(0, 10)),
    category: (body.category as string | null) ?? null,
    body_es: textToBlocks(body.body_es as string | null),
    body_en: textToBlocks(body.body_en as string | null),
    external_link: (body.external_link as string | null) ?? null,
    published: Boolean(body.published ?? false),
  };

  const { data, error } = await auth.supabase
    .from("field_notes")
    .insert(insert)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk(data, 201);
};
