import type { APIRoute } from "astro";
import { jsonOk, requireAdmin, textToBlocks } from "../../../lib/admin-helpers";

export const prerender = false;

const SCALARS = [
  "bio_one_line_es", "bio_one_line_en",
  "bio_short_es", "bio_short_en",
  "photos", "recognitions", "mentions",
  "press_pdf_url", "press_email",
] as const;

export const PATCH: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Record<string, unknown> = { id: "singleton" };
  for (const k of SCALARS) {
    if (k in body) patch[k] = body[k];
  }
  if ("bio_long_es" in body) patch.bio_long_es = textToBlocks(body.bio_long_es as string | null);
  if ("bio_long_en" in body) patch.bio_long_en = textToBlocks(body.bio_long_en as string | null);

  const { error } = await auth.supabase
    .from("press_kit")
    .upsert(patch, { onConflict: "id" });

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk({ id: "singleton" });
};
