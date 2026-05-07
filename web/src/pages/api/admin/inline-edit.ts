import type { APIRoute } from "astro";
import { jsonOk, requireAdmin, textToBlocks } from "../../../lib/admin-helpers";

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
  | { kind: "scalar"; table: string; pk: PK; column: string; portable?: boolean }
  | { kind: "json"; table: string; pk: PK; column: string; jsonKey: string }
  | { kind: "copy" };

/* ── Person (Daniel) — scalar fields ────────────────────────────── */
const DANIEL_PK: PK = { column: "id", value: "daniel" };
const danielScalars = (col: string): FieldSpec => ({
  kind: "scalar", table: "person", pk: DANIEL_PK, column: col,
});
const danielPortable = (col: string): FieldSpec => ({
  kind: "scalar", table: "person", pk: DANIEL_PK, column: col, portable: true,
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
  "daniel.bio_long_es":  danielPortable("bio_long_es"),
  "daniel.bio_long_en":  danielPortable("bio_long_en"),
  ...PROJECT_ENTRIES,
};

/* Landing-copy keys (`copy.<key>`) are accepted as a class — the key
 * after the `copy.` prefix maps directly into the landing_copy table.
 * Validation is by namespace prefix to avoid maintaining a duplicate
 * list of every individual key (the seed in 20260507_landing_copy.sql
 * is the source of truth). */
const COPY_KEY_PREFIXES = ["frame.", "notebook.", "ledger.", "closing.", "cold."] as const;
function isWritableCopyKey(rawKey: string): boolean {
  return (
    rawKey.length > 0 &&
    rawKey.length <= 200 &&
    !rawKey.includes(" ") &&
    COPY_KEY_PREFIXES.some((p) => rawKey.startsWith(p))
  );
}

/* Slug-keyed entities — paths like `article.my-slug.title` or
 * `article.my-slug.body_es`. The registry below declares which
 * columns are scalar vs PortableText for each entity kind. Trying
 * to write a column not in this list is rejected. */
type EntitySpec = {
  table: string;
  scalarCols: string[];
  portableCols: string[];
  /** PK column the slug maps to. Defaults to "slug"; daily briefs
   *  and other UUID-keyed entities use "id". */
  pkColumn?: string;
  /** Validator for the slug-position part of the path. Defaults to
   *  the slug regex; UUID-keyed entities pass a UUID matcher. */
  pkValidator?: (val: string) => boolean;
};
const ENTITY_REGISTRY: Record<string, EntitySpec> = {
  article: {
    table: "articles",
    scalarCols: ["title", "excerpt_es", "excerpt_en", "cover_url"],
    portableCols: ["body_es", "body_en"],
  },
  project: {
    // Project text scalars (title, summaries) are still ALSO served
    // via PROJECT_ENTRIES with the legacy hardcoded slug list — that
    // takes precedence in resolution. Hero media URLs are only here
    // so they work for ANY project slug, not just the original three.
    table: "projects",
    scalarCols: ["title", "summary_es", "summary_en", "hero_image_url", "hero_video_url"],
    portableCols: ["body_es", "body_en"],
  },
  art: {
    table: "art_pieces",
    scalarCols: ["title", "statement_es", "statement_en", "cover_url", "medium", "dimensions"],
    portableCols: [],
  },
  daily: {
    table: "daily_briefs",
    scalarCols: ["line_es", "line_en", "place", "image_url"],
    portableCols: [],
    pkColumn: "id",
    pkValidator: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  },
};
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
type EntityHit = {
  entity: keyof typeof ENTITY_REGISTRY;
  slug: string;
  column: string;
  kind: "scalar" | "portable";
};
function resolveEntityPath(fieldKey: string): EntityHit | null {
  const parts = fieldKey.split(".");
  if (parts.length !== 3) return null;
  const [entity, slug, column] = parts;
  const spec = ENTITY_REGISTRY[entity as keyof typeof ENTITY_REGISTRY];
  if (!spec) return null;
  const validator = spec.pkValidator ?? ((v) => SLUG_RE.test(v));
  if (!validator(slug)) return null;
  if (spec.scalarCols.includes(column))   return { entity: entity as keyof typeof ENTITY_REGISTRY, slug, column, kind: "scalar" };
  if (spec.portableCols.includes(column)) return { entity: entity as keyof typeof ENTITY_REGISTRY, slug, column, kind: "portable" };
  return null;
}

const MAX_LEN = 4000;

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    field?: string;
    value?: string | null;
  };

  const fieldKey = (body.field ?? "").trim();

  // Copy-table writes (`copy.<key>`) are validated by prefix; everything
  // else has to be in the explicit ALLOWLIST or resolve via the entity
  // registry below.
  let spec: FieldSpec | undefined = ALLOWLIST[fieldKey];
  let copyKey: string | null = null;
  let entityHit: EntityHit | null = null;
  if (!spec && fieldKey.startsWith("copy.")) {
    const rawKey = fieldKey.slice("copy.".length);
    if (!isWritableCopyKey(rawKey)) {
      return new Response(`Unknown or unwritable copy key: ${rawKey}`, { status: 400 });
    }
    copyKey = rawKey;
    spec = { kind: "copy" };
  }
  if (!spec) {
    entityHit = resolveEntityPath(fieldKey);
    if (entityHit) {
      spec = { kind: "copy" }; // sentinel — actual write handled below
    }
  }
  if (!spec) {
    return new Response(`Unknown or unwritable field: ${fieldKey}`, { status: 400 });
  }

  const value: string | null = body.value == null ? null : String(body.value);
  // PortableText bodies can be longer than scalar; bump cap for them.
  const limit = entityHit?.kind === "portable" ? 40_000 : MAX_LEN;
  if (value && value.length > limit) {
    return new Response(`Value too long for inline edit (>${limit} chars)`, { status: 413 });
  }

  // Slug- or id-keyed entity write — scalar or PortableText conversion.
  if (entityHit) {
    const ent = ENTITY_REGISTRY[entityHit.entity];
    const pk = ent.pkColumn ?? "slug";
    const writeValue = entityHit.kind === "portable" ? textToBlocks(value) : value;
    const { error } = await auth.supabase
      .from(ent.table)
      .update({ [entityHit.column]: writeValue })
      .eq(pk, entityHit.slug);
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ field: fieldKey, value });
  }

  if (spec.kind === "copy") {
    if (!copyKey) return new Response("Missing copy key", { status: 400 });
    const { error } = await auth.supabase
      .from("landing_copy")
      .upsert({ key: copyKey, value }, { onConflict: "key" });
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ field: fieldKey, value });
  }

  if (spec.kind === "scalar") {
    const writeValue = spec.portable ? textToBlocks(value) : value;
    const patch: Record<string, unknown> = {
      [spec.pk.column]: spec.pk.value,
      [spec.column]: writeValue,
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
