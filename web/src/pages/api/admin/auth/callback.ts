import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../../../lib/supabase";
import { jsonForScript, safeNextPath } from "../../../../lib/security";

export const prerender = false;

const OTP_TYPES = new Set(["signup", "magiclink", "recovery", "invite", "email_change", "email"] as const);
type OtpType = "signup" | "magiclink" | "recovery" | "invite" | "email_change" | "email";

/**
 * Handles the magic-link / email-confirmation callback.
 *
 * Three shapes Supabase may send:
 *   1. PKCE magic link    →  ?code=…
 *   2. Email confirmation →  ?token_hash=…&type=signup|magiclink|recovery
 *   3. Implicit flow      →  #access_token=…&refresh_token=… (in URL hash)
 *
 * 1 + 2 exchange server-side (the SSR client writes the session cookie).
 * 3 serves a tiny bridge that posts the fragment tokens to
 * /api/admin/auth/exchange.
 *
 * `next` is reduced to a same-origin path before it is used anywhere —
 * it was an open redirect (`?next=@evil.com`) and, in the bridge script,
 * a reflected XSS sink.
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");

  const fail = (msg: string) =>
    Response.redirect(`${url.origin}/admin/login?error=${encodeURIComponent(msg)}`, 303);
  const done = () => Response.redirect(`${url.origin}${next}`, 303);

  const supabase = getSupabaseServer(cookies);
  if (!supabase) return fail("Supabase no configurado");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] code exchange failed:", error.message);
      return fail("El enlace no es válido o ya venció");
    }
    return done();
  }

  if (tokenHash && type) {
    if (!OTP_TYPES.has(type as OtpType)) return fail("Enlace no válido");
    const { error } = await supabase.auth.verifyOtp({ type: type as OtpType, token_hash: tokenHash });
    if (error) {
      console.error("[auth/callback] verifyOtp failed:", error.message);
      return fail("El enlace no es válido o ya venció");
    }
    return done();
  }

  const html = `<!doctype html><meta charset="utf-8" /><meta name="robots" content="noindex" /><title>…</title>
<script>
(async function(){
  var hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
  var p = new URLSearchParams(hash);
  var access = p.get('access_token');
  var refresh = p.get('refresh_token');
  if (!access || !refresh) { location.replace('/admin/login?error=Sin+tokens'); return; }
  var res = await fetch('/api/admin/auth/exchange', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ access: access, refresh: refresh })
  });
  if (!res.ok) { location.replace('/admin/login?error=Exchange+fall%C3%B3'); return; }
  location.replace(${jsonForScript(next)});
})();
</script>`;

  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
};
