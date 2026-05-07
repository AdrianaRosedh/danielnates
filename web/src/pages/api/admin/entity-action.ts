import type { APIRoute } from "astro";
import { jsonOk, requireAdmin } from "../../../lib/admin-helpers";

/**
 * Inline entity-action endpoint — used by the EditOverlay's
 * Publish toggle and Delete button on slug- or id-keyed detail
 * pages. Accepts:
 *
 *   POST { entity, id, action }
 *     entity = "article" | "art" | "project" | "daily"
 *     id     = the entity's PK value (slug or UUID)
 *     action = "publish" | "unpublish" | "delete"
 *
 * Mirrors the entity registry in inline-edit.ts so coverage stays
 * in sync. Same admin gate as the other inline endpoints.
 */

export const prerender = false;

type EntityKey = "article" | "art" | "project" | "daily";
type EntityCfg = { table: string; pkColumn: string; pkValidator: (v: string) => boolean };

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,80}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REGISTRY: Record<EntityKey, EntityCfg> = {
  article: { table: "articles",      pkColumn: "slug", pkValidator: (v) => SLUG_RE.test(v) },
  art:     { table: "art_pieces",    pkColumn: "slug", pkValidator: (v) => SLUG_RE.test(v) },
  project: { table: "projects",      pkColumn: "slug", pkValidator: (v) => SLUG_RE.test(v) },
  daily:   { table: "daily_briefs",  pkColumn: "id",   pkValidator: (v) => UUID_RE.test(v) },
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const auth = await requireAdmin(cookies);
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as {
    entity?: string;
    id?: string;
    action?: string;
  };

  const entity = (body.entity ?? "") as EntityKey;
  const id = (body.id ?? "").trim();
  const action = (body.action ?? "").trim();

  const cfg = REGISTRY[entity];
  if (!cfg) return new Response(`Unknown entity: ${entity}`, { status: 400 });
  if (!cfg.pkValidator(id)) return new Response("Invalid id", { status: 400 });

  if (action === "publish" || action === "unpublish") {
    const { error } = await auth.supabase
      .from(cfg.table)
      .update({ published: action === "publish" })
      .eq(cfg.pkColumn, id);
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ entity, id, action });
  }

  if (action === "delete") {
    const { error } = await auth.supabase
      .from(cfg.table)
      .delete()
      .eq(cfg.pkColumn, id);
    if (error) return new Response(error.message, { status: 400 });
    return jsonOk({ entity, id, action });
  }

  return new Response(`Unknown action: ${action}`, { status: 400 });
};
