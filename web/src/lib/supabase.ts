import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AstroCookies } from "astro";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => !!url && !!anon;

/**
 * Anonymous client (RLS-respecting). Use from public pages and
 * unauthenticated read paths.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Service-role client (BYPASSES RLS). Server-only.
 * Use only when you genuinely need to skip policies.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        // Astro cookies has no getAll, so we explicitly enumerate
        // the cookies @supabase/ssr cares about (sb-* prefix family).
        const candidates = [
          "sb-access-token",
          "sb-refresh-token",
          // @supabase/ssr defaults to "sb-<project-ref>-auth-token" but
          // we bridge by checking the access/refresh pair we set.
        ];
        const out: { name: string; value: string }[] = [];
        for (const n of candidates) {
          const v = cookies.get(n)?.value;
          if (v) out.push({ name: n, value: v });
        }
        return out;
      },
      setAll(list) {
        for (const { name, value, options } of list) {
          const o = options as CookieOptions | undefined;
          cookies.set(name, value, {
            httpOnly: o?.httpOnly ?? true,
            secure: o?.secure ?? true,
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

/** Backward-compat alias used by older admin code paths. */
export const getSupabaseFromRequest = getSupabaseServer;
