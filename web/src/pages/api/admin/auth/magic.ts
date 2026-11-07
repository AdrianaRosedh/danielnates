import type { APIRoute } from "astro";
import { getAdminScopeFor, getSupabase, getSupabaseAdmin } from "../../../../lib/supabase";
import { safeNextPath } from "../../../../lib/security";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sends a sign-in link — but only to allowlisted editors.
 *
 * Every well-formed request gets the same "check your email" answer,
 * so the endpoint can't be used to learn who is an editor, to create
 * Supabase accounts, or to mail links to arbitrary addresses.
 */
export const POST: APIRoute = async ({ request, url }) => {
  const toLogin = (q: string) => Response.redirect(`${url.origin}/admin/login?${q}`, 303);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return toLogin("error=Solicitud+inv%C3%A1lida");
  }
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = safeNextPath(String(form.get("next") ?? ""));

  if (!EMAIL.test(email) || email.length > 320) return toLogin("error=Correo+inv%C3%A1lido");

  const sent = toLogin(`sent=${encodeURIComponent(email)}`);

  const scope = await getAdminScopeFor(email);
  if (!scope) return sent; // identical response; nothing is sent

  const supabase = getSupabase();
  if (!supabase) return toLogin("error=Supabase+no+configurado");

  // Allowlisted editors get an auth user on first sign-in even when
  // public sign-ups are disabled in Supabase (recommended).
  const admin = getSupabaseAdmin();
  if (admin) {
    const { error } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (error && !/already|exists|registered/i.test(error.message)) {
      console.error("[magic-link] could not provision editor:", error.message);
    }
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${url.origin}/api/admin/auth/callback?next=${encodeURIComponent(next)}`,
      shouldCreateUser: !admin,
    },
  });
  if (error) {
    console.error("[magic-link] send failed:", error.message);
    return toLogin("error=No+se+pudo+enviar+el+enlace.+Intenta+en+un+momento.");
  }
  return sent;
};
