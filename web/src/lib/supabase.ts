import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const serviceRole = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Public client (RLS-respecting). Returns null if env not configured yet.
 * Once you've created your Supabase project, regenerate typed Database type with:
 *   npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts
 * then change the generic on createClient to <Database>.
 */
export function getSupabase(): SupabaseClient | null {
  if (!url || !anon) return null;
  return createClient(url, anon, { auth: { persistSession: false } });
}

/** Server-only client that bypasses RLS. Use for trusted writes from API routes. */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceRole) return null;
  return createClient(url, serviceRole, { auth: { persistSession: false } });
}

export const isSupabaseConfigured = () => !!url && !!anon;
