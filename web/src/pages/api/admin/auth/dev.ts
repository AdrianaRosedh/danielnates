import type { APIRoute } from "astro";
import { getSupabaseAdmin, getSupabaseServer } from "../../../../lib/supabase";

export const prerender = false;

/**
 * DEV-ONLY shortcut to sign into the admin without a magic link.
 *
 * Returns 404 in production. In dev, generates a real Supabase session
 * for any whitelisted admin_emails entry (defaults to the seeded
 * rose@roseiies.com) by issuing an OTP through the service-role client
 * and exchanging it for a session.
 *
 * Why this is safe in dev: the route is gated on import.meta.env.DEV
 * and on the `localhost`/`127.0.0.1` host, AND only signs in emails
 * already whitelisted in admin_emails (which is RLS-gated to admins).
 */
export const GET: APIRoute = async ({ url, cookies }) => {
  if (!import.meta.env.DEV) return new Response("Not found", { status: 404 });
  const host = url.hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    return new Response("Dev login is localhost-only", { status: 403 });
  }

  const requested = (url.searchParams.get("email") ?? "rose@roseiies.com")
    .trim()
    .toLowerCase();

  const admin = getSupabaseAdmin();
  if (!admin) {
    return new Response(
      "Dev login needs SUPABASE_SERVICE_ROLE_KEY in web/.env",
      { status: 500 },
    );
  }

  // Confirm the email is whitelisted before doing anything privileged.
  const { data: whitelisted, error: wlErr } = await admin
    .from("admin_emails")
    .select("email")
    .eq("email", requested)
    .maybeSingle();
  if (wlErr) return new Response(wlErr.message, { status: 500 });
  if (!whitelisted) {
    return new Response(
      `${requested} is not in admin_emails. Insert it first.`,
      { status: 403 },
    );
  }

  // Use admin.generateLink to mint a one-shot magiclink token, then
  // verify it server-side to install a real session. Cleanest path:
  // it works whether or not the user has been confirmed, and goes
  // through the same SSR cookie adapter as production logins.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: requested,
  });
  if (linkErr || !linkData?.properties?.hashed_token) {
    return new Response(linkErr?.message ?? "Could not mint link", { status: 500 });
  }

  const supabase = getSupabaseServer(cookies);
  if (!supabase) return new Response("Supabase not configured", { status: 500 });

  const { error: verifyErr } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: linkData.properties.hashed_token,
  });
  if (verifyErr) return new Response(verifyErr.message, { status: 400 });

  return Response.redirect(`${url.origin}/admin`, 303);
};
