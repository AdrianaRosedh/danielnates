import type { APIRoute } from "astro";
import { getSupabase } from "../../../../lib/supabase";

export const prerender = false;

/**
 * Handles the magic-link callback. Supabase appends a token-bearing hash
 * fragment client-side. We can't read URL hash on the server, so this route
 * serves a tiny page that posts the tokens back to /api/admin/auth/exchange.
 */
export const GET: APIRoute = async ({ url }) => {
  const next = url.searchParams.get("next") ?? "/admin";
  const code = url.searchParams.get("code");

  // PKCE flow — Supabase sends ?code=… directly.
  if (code) {
    const supabase = getSupabase();
    if (!supabase) {
      return Response.redirect(`${url.origin}/admin/login?error=No+Supabase`, 303);
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session) {
      return Response.redirect(
        `${url.origin}/admin/login?error=${encodeURIComponent(error?.message ?? "Auth failed")}`,
        303,
      );
    }

    const { access_token, refresh_token } = data.session;

    const headers = new Headers({ Location: next });
    const cookieOpts = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000";
    headers.append("Set-Cookie", `sb-access-token=${access_token}; ${cookieOpts}`);
    headers.append("Set-Cookie", `sb-refresh-token=${refresh_token}; ${cookieOpts}`);
    return new Response(null, { status: 303, headers });
  }

  // Implicit flow — tokens arrive in URL fragment. Tiny client bridge.
  const html = `<!doctype html><meta charset="utf-8" /><title>…</title>
<script>
(async function(){
  var hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
  var p = new URLSearchParams(hash);
  var access = p.get('access_token');
  var refresh = p.get('refresh_token');
  if (!access || !refresh) {
    location.replace('/admin/login?error=Sin+tokens');
    return;
  }
  var res = await fetch('/api/admin/auth/exchange', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ access, refresh })
  });
  if (!res.ok) { location.replace('/admin/login?error=Exchange+fall%C3%B3'); return; }
  location.replace(${JSON.stringify(next)});
})();
</script>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
};
