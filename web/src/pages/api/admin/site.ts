import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

export const prerender = false;

const FIELDS = [
  "site_name",
  "description_es", "description_en",
  "default_og_url",
  "navigation",
  "footer",
] as const;

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = { id: "singleton" };
  for (const k of FIELDS) {
    if (k in body) patch[k] = body[k];
  }

  const { error } = await auth.supabase
    .from("site_settings")
    .upsert(patch, { onConflict: "id" });

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk({ id: "singleton" });
};
