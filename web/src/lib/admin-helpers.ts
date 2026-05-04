import type { AstroCookies } from "astro";
import { getSupabaseServer, getUserFromRequest } from "./supabase";

/**
 * Standard guard for admin API routes. Returns either:
 *   { ok: true, supabase } — auth ok, ready to query
 *   { ok: false, response } — Response to return immediately
 */
export async function requireAdmin(cookies: AstroCookies) {
  const user = await getUserFromRequest(cookies);
  if (!user) return { ok: false as const, response: new Response("Unauthorized", { status: 401 }) };
  const supabase = getSupabaseServer(cookies);
  if (!supabase) return { ok: false as const, response: new Response("Supabase not configured", { status: 500 }) };
  return { ok: true as const, supabase, user };
}

/** Convert plain text (with blank-line paragraphs) into Portable Text-ish blocks. */
export function textToBlocks(text: string | null | undefined) {
  if (!text || !text.trim()) return null;
  return text
    .split(/\n\s*\n/)
    .map((para, i) => ({
      _type: "block",
      _key: `p${i}`,
      style: "normal",
      children: [{ _type: "span", _key: `p${i}-0`, text: para.trim(), marks: [] }],
      markDefs: [],
    }));
}

export function jsonOk(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
