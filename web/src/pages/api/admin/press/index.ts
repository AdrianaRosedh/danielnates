import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const outlet = String(body.outlet ?? "").trim();
  const url = String(body.url ?? "").trim();
  if (!outlet) return new Response("Outlet is required", { status: 400 });
  if (!url) return new Response("URL is required", { status: 400 });

  const insert = {
    outlet,
    url,
    title: ((body.title as string | null) ?? "").toString().trim() || null,
    date: ((body.date as string | null) ?? "").toString().trim() || null,
    language: (body.language === "en" ? "en" : "es") as "es" | "en",
  };

  const { data, error } = await auth.supabase
    .from("press_mentions")
    .insert(insert)
    .select("id")
    .single();

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk(data, 201);
};
