import type { AstroCookies } from "astro";
import { getAdminScopeFor, getSupabaseServer } from "./supabase";

/**
 * Standard guard for admin API routes. A verified session is not
 * enough — the email must be on the admin allowlist (admin_emails).
 * RLS enforces the same rule in the database; checking here too means
 * a signed-in non-admin gets an honest 403 instead of a silent no-op.
 *
 * Returns either:
 *   { ok: true, supabase, user, scope } — ready to query as the user
 *   { ok: false, response }             — return it immediately
 */
export async function requireAdmin(cookies: AstroCookies) {
  const supabase = getSupabaseServer(cookies);
  if (!supabase) return { ok: false as const, response: new Response("Supabase not configured", { status: 500 }) };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { ok: false as const, response: new Response("Unauthorized", { status: 401 }) };
  const scope = await getAdminScopeFor(user.email);
  if (!scope) return { ok: false as const, response: new Response("Forbidden", { status: 403 }) };
  return { ok: true as const, supabase, user, scope };
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

/** Inverse of textToBlocks: flatten Portable Text blocks back to plain text
 *  (paragraphs separated by blank lines). Lossy for inline marks/links. */
export function blocksToText(blocks: unknown): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      const block = b as { _type?: string; children?: { text?: string }[] };
      if (block?._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((c) => c?.text ?? "").join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

export function jsonOk(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
