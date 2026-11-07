import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";
import { UPLOAD_MAX_BYTES, formatMegabytes, uploadExtension } from "../../../lib/uploads";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response("Invalid upload body", { status: 400 });
  }

  const file = form.get("file");
  const folder = String(form.get("folder") ?? "misc").replace(/[^a-z0-9_-]/gi, "").slice(0, 40) || "misc";

  if (!(file instanceof File)) return new Response("No file", { status: 400 });
  if (file.size === 0) return new Response("Empty file", { status: 400 });
  if (file.size > UPLOAD_MAX_BYTES) {
    return new Response(`Too large (max ${formatMegabytes(UPLOAD_MAX_BYTES)})`, { status: 413 });
  }

  const ext = uploadExtension(file.type);
  if (!ext) return new Response("Unsupported file type", { status: 415 });

  const key = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await auth.supabase.storage.from("media").upload(key, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) {
    console.error("[upload] storage error:", error.message);
    return new Response("Upload failed", { status: 500 });
  }

  const { data } = auth.supabase.storage.from("media").getPublicUrl(key);
  return jsonOk({ url: data.publicUrl, key });
};
