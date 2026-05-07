import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

/**
 * Inline-edit endpoint for the public-site admin overlay.
 *
 * Accepts a single field write keyed by `entity.field` path notation
 * (e.g. "daniel.tagline_es"). Maps the entity to a Supabase table and
 * upserts the change. Designed to be safe by allowlist — only the
 * fields explicitly registered below are writable, regardless of what
 * the client sends.
 *
 * Future entities (project framings, ledger rows, etc.) get added to
 * the ALLOWLIST below as we extend the inline-edit pattern.
 */

export const prerender = false;

type EntityKey = keyof typeof ALLOWLIST;
type FieldUpdate = { table: string; pk: { column: string; value: string }; column: string };

/** Each allowlist entry maps `entity.field` → the table/row/column to write. */
const ALLOWLIST: Record<string, FieldUpdate> = {
  "daniel.tagline_es":  { table: "person", pk: { column: "id", value: "daniel" }, column: "tagline_es"  },
  "daniel.tagline_en":  { table: "person", pk: { column: "id", value: "daniel" }, column: "tagline_en"  },
  "daniel.subline_es":  { table: "person", pk: { column: "id", value: "daniel" }, column: "subline_es"  },
  "daniel.subline_en":  { table: "person", pk: { column: "id", value: "daniel" }, column: "subline_en"  },
  "daniel.bio_short_es":{ table: "person", pk: { column: "id", value: "daniel" }, column: "bio_short_es"},
  "daniel.bio_short_en":{ table: "person", pk: { column: "id", value: "daniel" }, column: "bio_short_en"},
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    field?: string;
    value?: string | null;
  };

  const fieldKey = (body.field ?? "").trim();
  if (!fieldKey || !(fieldKey in ALLOWLIST)) {
    return new Response(`Unknown or unwritable field: ${fieldKey}`, { status: 400 });
  }

  const target = ALLOWLIST[fieldKey as EntityKey];
  // Empty string is allowed (clear a tagline). null clears the column.
  const value: string | null =
    body.value == null ? null : String(body.value);

  // Hard cap on the size of any single inline write — protects against
  // accidental paste bombs. PortableText fields will use a different
  // endpoint with its own limits.
  if (value && value.length > 4000) {
    return new Response("Value too long for inline edit (>4000 chars)", { status: 413 });
  }

  const patch: Record<string, unknown> = {
    [target.pk.column]: target.pk.value,
    [target.column]: value,
  };

  const { error } = await auth.supabase
    .from(target.table)
    .upsert(patch, { onConflict: target.pk.column });

  if (error) return new Response(error.message, { status: 400 });

  return jsonOk({ field: fieldKey, value });
};
