import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../../../lib/supabase";

export const prerender = false;

/**
 * Handles the magic-link / email-confirmation callback.
 *
 * Three shapes Supabase may send:
 *   1. PKCE magic link    →  ?code=…
 *   2. Email confirmation →  ?token_hash=…&type=signup|magiclink|recovery
 *   3. Implicit flow      →  #access_token=…&refresh_token=… (in URL hash)
 *
 * For 1 + 2 we exchange server-side via the SSR client, which writes the
 * session cookie via our shared cookie adapter — this is what keeps the
 * middleware able to find the session afterwards.
 *
 * For 3 we serve a tiny client bridge that posts the tokens to
 * /api/admin/auth/exchange.
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  const next = url.searchParams.get("next") ?? "/admin";
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const fail = (msg: string) =>
    Response.redirect(`${url.origin}/admin/login?error=${encodeURIComponent(msg)}`, 303);

  const supabase = getSupabaseServer(cookies);
  if (!supabase) return fail("Supabase no configurado");

  // 1. PKCE magic-link flow
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return fail(error.message);
    return Response.redirect(`${url.origin}${next}`, 303);
  }

  // 2. Email-confirmation / verify-OTP flow (this is what "Confirm Your
  //    Signup" links use after Supabase's "Confirm email" toggle is on).
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "signup" | "magiclink" | "recovery" | "invite" | "email_change",
      token_hash: tokenHash,
    });
    if (error) return fail(error.message);
    return Response.redirect(`${url.origin}${next}`, 303);
  }

  // 3. Implicit flow — tokens come in URL fragment, only readable client-side
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
