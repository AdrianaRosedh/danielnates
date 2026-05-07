import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

/**
 * Inline-edit endpoint for the public-site admin overlay.
 *
 * Accepts a single field write keyed by a path string (e.g.
 * "daniel.tagline_es" or "project.olivea.kicker_es"). The field is
 * looked up in the ALLOWLIST below and applied as either:
 *
 *   • scalar — upsert one column on a row
 *   • json   — read-modify-write a single key inside a JSONB column
 *
 * Only fields registered in the allowlist are writable. New fields
 * get added there as we extend the inline-edit pattern across the
 * site (ledger entries, chapter framings, etc.).
 */

export const prerender = false;

type PK = { column: string; value: string };
type FieldSpec =
  | { kind: "scalar"; table: string; pk: PK; column: string }
  | { kind: "json"; table: string; pk: PK; column: string; jsonKey: string };

/* ── Person (Daniel) — scalar fields ────────────────────────────── */
const DANIEL_PK: PK = { column: "id", value: "daniel" };
const danielScalars = (col: string): FieldSpec => ({
  kind: "scalar", table: "person", pk: DANIEL_PK, column: col,
});

/* ── Project framings — JSONB nested keys on projects.framing ───── */
function projectScalar(slug: string, col: string): FieldSpec {
  return {
    kind: "scalar",
    table: "projects",
    pk: { column: "slug", value: slug },
    column: col,
  };
}
function projectFraming(slug: string, jsonKey: string): FieldSpec {
  return {
    kind: "json",
    table: "projects",
    pk: { column: "slug", value: slug },
    column: "framing",
    jsonKey,
  };
}

const PROJECT_SLUGS = ["olivea", "fritanguita", "maizal"] as const;

const PROJECT_ENTRIES: Record<string, FieldSpec> = {};
for (const slug of PROJECT_SLUGS) {
  // Scalar columns
  PROJECT_ENTRIES[`project.${slug}.title`]      = projectScalar(slug, "title");
  PROJECT_ENTRIES[`project.${slug}.summary_es`] = projectScalar(slug, "summary_es");
  PROJECT_ENTRIES[`project.${slug}.summary_en`] = projectScalar(slug, "summary_en");
  // JSONB-nested framing keys
  for (const k of ["kicker_es", "kicker_en", "intro_es", "intro_en", "meta_es", "meta_en"] as const) {
    PROJECT_ENTRIES[`project.${slug}.${k}`] = projectFraming(slug, k);
  }
}

const ALLOWLIST: Record<string, FieldSpec> = {
  "daniel.name":         danielScalars("name"),
  "daniel.tagline_es":   danielScalars("tagline_es"),
  "daniel.tagline_en":   danielScalars("tagline_en"),
  "daniel.subline_es":   danielScalars("subline_es"),
  "daniel.subline_en":   danielScalars("subline_en"),
  "daniel.bio_short_es": danielScalars("bio_short_es"),
  "daniel.bio_short_en": danielScalars("bio_short_en"),
  ...PROJECT_ENTRIES,
};

const MAX_LEN = 4000;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    field?: string;
    value?: string | null;
  };

  const fieldKey = (body.field ?? "").trim();
  const spec = ALLOWLIST[fieldKey];
  if (!spec) {
    return new Response(`Unknown or unwritable field: ${fieldKey}`, { status: 400 });
  }

  const value: string | null = body.value == null ? null : String(body.value);
  if (value && value.length > MAX_LEN) {
    return new Response(`Value too long for inline edit (>${MAX_LEN} chars)`, { status: 413 });
  }

  if (spec.kind === "scalar") {
    const patch: Record<string, unknown> = {
      [spec.pk.column]: spec.pk.value,
      [spec.column]: value,
    };
    const { error } = await auth.supabase
      .from(spec.table)
      .upsert(patch, { onConflict: spec.pk.column });
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ field: fieldKey, value });
  }

  // kind === "json": read-modify-write the JSONB column.
  const sel = await auth.supabase
    .from(spec.table)
    .select(spec.column)
    .eq(spec.pk.column, spec.pk.value)
    .maybeSingle();

  if (sel.error) return new Response(sel.error.message, { status: 400 });

  const current = (sel.data as Record<string, unknown> | null)?.[spec.column];
  const next: Record<string, unknown> =
    current && typeof current === "object" && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {};
  next[spec.jsonKey] = value;

  const { error } = await auth.supabase
    .from(spec.table)
    .update({ [spec.column]: next })
    .eq(spec.pk.column, spec.pk.value);

  if (error) return new Response(error.message, { status: 400 });
  return jsonOk({ field: fieldKey, value });
};
