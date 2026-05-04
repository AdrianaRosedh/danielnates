import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AstroCookies } from "astro";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = () => !!url && !!anon;

/** Anonymous client (RLS-respecting). Used by public pages. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Service-role client (bypasses RLS). Server-only. Use sparingly. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Authenticated client built from the request's session cookie.
 * Use this in admin pages / API routes — it executes queries AS the user,
 * so RLS policies (is_admin()) are evaluated correctly.
 */
export function getSupabaseFromRequest(cookies: AstroCookies): SupabaseClient | null {
  if (!url || !anon) return null;
  const access = cookies.get("sb-access-token")?.value;
  const refresh = cookies.get("sb-refresh-token")?.value;
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: access ? { headers: { Authorization: `Bearer ${access}` } } : undefined,
  });
  if (access && refresh) {
    // Make .auth.getUser() work in this client
    client.auth.setSession({ access_token: access, refresh_token: refresh }).catch(() => {});
  }
  return client;
}

/** Returns the current user from the request, or null. */
export async function getUserFromRequest(cookies: AstroCookies) {
  const c = getSupabaseFromRequest(cookies);
  if (!c) return null;
  const { data } = await c.auth.getUser();
  return data.user ?? null;
}
