import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../../../lib/supabase";

export const prerender = false;

/**
 * Implicit-flow bridge: receives access + refresh tokens that arrived in
 * the URL hash on the callback page, and uses the SSR client to set the
 * session — which writes the proper `sb-<ref>-auth-token` cookie via our
 * shared adapter so the middleware can read it back.
 */
export const POST: APIRoute = async ({ request, cookies }) => {
  const body: unknown = await request.json().catch(() => null);
  const { access, refresh } = (body && typeof body === "object" ? body : {}) as {
    access?: unknown;
    refresh?: unknown;
  };
  if (typeof access !== "string" || typeof refresh !== "string" || !access || !refresh) {
    return new Response("bad request", { status: 400 });
  }

  const supabase = getSupabaseServer(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const { error } = await supabase.auth.setSession({
    access_token: access,
    refresh_token: refresh,
  });
  if (error) {
    console.error("[auth/exchange] setSession failed:", error.message);
    return new Response("invalid session", { status: 400 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};
