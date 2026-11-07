import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/** Project ref extracted from the URL — used to compose the SSR client's
 *  expected auth cookie name (`sb-<ref>-auth-token`). */
const projectRef = (() => {
  try {
    const host = url ? new URL(url).host : "";
    return host.split(".")[0] || "";
  } catch {
    return "";
  }
})();

export const isSupabaseConfigured = () => !!url && !!anon;

/** Every Supabase HTTP call gets a hard deadline — a stalled request
 *  must fail fast instead of hanging the SSR render until the platform
 *  kills the function. */
const REQUEST_TIMEOUT_MS = 8_000;
const fetchWithTimeout: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    signal: init?.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)])
      : AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

const STATELESS = {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: { fetch: fetchWithTimeout },
} as const;

/* Stateless clients carry no session, so one instance per server
 * process is shared across requests (supabase-js is HTTP/fetch based —
 * there is no socket pool to exhaust). */
let anonClient: SupabaseClient | null = null;
let adminClient: SupabaseClient | null = null;

/**
 * Anonymous client (RLS-respecting). Use from public pages and
 * unauthenticated read paths.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return (anonClient ??= createClient(url, anon, STATELESS));
}

/**
 * Service-role client (BYPASSES RLS). Server-only — never import from
 * client scripts. Use only when you genuinely need to skip policies.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRole) return null;
  return (adminClient ??= createClient(url, serviceRole, STATELESS));
}

/** Every cookie name the auth session can live under (current chunked
 *  `sb-<ref>-auth-token[.n]` plus legacy names) — used to read the
 *  session and to clear it completely on sign-out. */
export function authCookieNames(): string[] {
  const names = ["sb-access-token", "sb-refresh-token"];
  if (projectRef) {
    names.push(`sb-${projectRef}-auth-token`);
    for (let i = 0; i < 6; i++) names.push(`sb-${projectRef}-auth-token.${i}`);
  }
  return names;
}

/**
 * Server-side authenticated client backed by Astro cookies.
 * Built on @supabase/ssr — the official 2024+ SSR pattern.
 *
 * Queries run AS the signed-in user, so RLS policies (is_admin())
 * evaluate correctly. Cookies + refresh tokens handled automatically.
 */
export function getSupabaseServer(cookies: AstroCookies): SupabaseClient | null {
  if (!url || !anon) return null;

  /* @supabase/ssr writes the session as a single JSON-encoded cookie
   * named `sb-<project-ref>-auth-token`. For long sessions it chunks
   * across `.0`, `.1`, `.2` … We have to enumerate all candidates
   * explicitly because AstroCookies has no list/keys API.
   *
   * Also keep the legacy `sb-access-token` / `sb-refresh-token` names
   * for any older sessions still in browsers. */
  const candidates = authCookieNames();

  return createServerClient(url, anon, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        const out: { name: string; value: string }[] = [];
        for (const n of candidates) {
          const v = cookies.get(n)?.value;
          if (v) out.push({ name: n, value: v });
        }
        return out;
      },
      setAll(list) {
        // PROD defaults to secure; DEV (http://localhost) cannot use
        // Secure or browsers silently drop the cookie — which is what
        // caused the post-magic-link redirect loop.
        const isDev = !!import.meta.env.DEV;
        for (const { name, value, options } of list) {
          const o = options as CookieOptions | undefined;
          cookies.set(name, value, {
            httpOnly: o?.httpOnly ?? true,
            secure: o?.secure ?? !isDev,
            sameSite: (o?.sameSite as "lax" | "strict" | "none" | undefined) ?? "lax",
            path: o?.path ?? "/",
            maxAge: o?.maxAge,
            domain: o?.domain,
            expires: o?.expires,
          });
        }
      },
    },
  });
}

/** Returns the current user from the request, or null. */
export async function getUserFromRequest(cookies: AstroCookies) {
  const c = getSupabaseServer(cookies);
  if (!c) return null;
  const { data } = await c.auth.getUser();
  return data.user ?? null;
}

/** Looks up the admin_emails.scope for an email — `'all'` for full
 *  admin, or a project slug for scoped access. Returns null if the
 *  email is not whitelisted. Uses the service-role client to bypass
 *  RLS on admin_emails. */
export async function getAdminScopeFor(email: string | null | undefined): Promise<string | null> {
  if (!email) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from("admin_emails")
    .select("scope")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error) {
    console.error("[auth] admin scope lookup failed:", error.message);
    return null;
  }
  return (data?.scope as string | undefined) ?? null;
}

/** Backward-compat alias used by older admin code paths. */
export const getSupabaseFromRequest = getSupabaseServer;
