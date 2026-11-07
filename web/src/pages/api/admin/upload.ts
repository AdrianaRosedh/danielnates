import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

export const prerender = false;

/* Vercel caps a function request body at 4.5 MB — stay under it. The
 * storage bucket enforces its own size + MIME allowlist as well. */
const MAX_BYTES = 4 * 1024 * 1024;

/* Content type → stored extension. The client's file name and MIME are
 * never trusted for the stored object: no SVG/HTML (stored XSS on the
 * public bucket), extension derived from the allowlisted type. */
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "application/pdf": "pdf",
};

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
  if (file.size > MAX_BYTES) return new Response("Too large (max 4 MB)", { status: 413 });

  const ext = ALLOWED[file.type];
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
