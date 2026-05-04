import type { APIRoute } from "astro";
import { jsonOk, requireAdmin, textToBlocks } from "../../../lib/admin-helpers";

export const prerender = false;

const SCALARS = [
  "name",
  "tagline_es", "tagline_en",
  "subline_es", "subline_en",
  "portrait_url",
  "bio_short_es", "bio_short_en",
  "pillars",
  "voice",
  "social",
] as const;

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = { id: "daniel" };
  for (const k of SCALARS) {
    if (k in body) patch[k] = body[k];
  }
  if ("bio_long_es" in body) patch.bio_long_es = textToBlocks(body.bio_long_es as string | null);
  if ("bio_long_en" in body) patch.bio_long_en = textToBlocks(body.bio_long_en as string | null);

  // Upsert so this works whether or not the row exists yet.
  const { error } = await auth.supabase
    .from("person")
    .upsert(patch, { onConflict: "id" });

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk({ id: "daniel" });
};
