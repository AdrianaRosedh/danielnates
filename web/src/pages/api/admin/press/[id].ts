import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../../lib/admin-helpers";

export const prerender = false;

const FIELDS = ["outlet", "title", "url", "date", "language"] as const;

export const PATCH: APIRoute = async ({ params, request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const id = params.id as string;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = {};
  for (const k of FIELDS) {
    if (k in body) {
      const v = body[k];
      if (k === "language") {
        patch[k] = v === "en" ? "en" : "es";
      } else if (typeof v === "string") {
        const trimmed = v.trim();
        patch[k] = trimmed === "" && k !== "outlet" && k !== "url" ? null : trimmed;
      } else {
        patch[k] = v;
      }
    }
  }

  const { data, error } = await auth.supabase
    .from("press_mentions")
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
    .from("press_mentions")
    .delete()
    .eq("id", params.id as string);

  if (error) return new Response(error.message, { status: 400 });
  return new Response(null, { status: 204 });
};
