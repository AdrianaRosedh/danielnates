import type { APIRoute } from "astro";
import { getSupabaseFromRequest, getUserFromRequest } from "../../../lib/supabase";

export const prerender = false;

const MAX_BYTES = 12 * 1024 * 1024; // 12MB

export const POST: APIRoute = async ({ request, cookies }) => {
  const user = await getUserFromRequest(cookies);
  if (!user) return new Response("Unauthorized", { status: 401 });

  const supabase = getSupabaseFromRequest(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc").replace(/[^a-z0-9_-]/gi, "");

  if (!(file instanceof File)) return new Response("No file", { status: 400 });
  if (file.size > MAX_BYTES) return new Response("Too large (max 12MB)", { status: 413 });

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ext || "bin";
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const { error } = await supabase.storage.from("media").upload(key, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) {
    console.error("[upload] storage error:", error);
    return new Response(error.message, { status: 500 });
  }

  const { data } = supabase.storage.from("media").getPublicUrl(key);
  return new Response(JSON.stringify({ url: data.publicUrl, key }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
