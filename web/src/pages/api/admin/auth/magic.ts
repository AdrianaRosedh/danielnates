import type { APIRoute } from "astro";
import { getSupabase } from "../../../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request, url }) => {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const next = String(form.get("next") ?? "/admin");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.redirect(`${url.origin}/admin/login?error=Correo+inv%C3%A1lido`, 303);
  }

  const supabase = getSupabase();
  if (!supabase) {
    return Response.redirect(`${url.origin}/admin/login?error=Supabase+no+configurado`, 303);
  }

  const redirectTo = `${url.origin}/api/admin/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) {
    console.error("[magic-link] error:", error.message);
    return Response.redirect(
      `${url.origin}/admin/login?error=${encodeURIComponent(error.message)}`,
      303,
    );
  }

  return Response.redirect(
    `${url.origin}/admin/login?sent=${encodeURIComponent(email)}`,
    303,
  );
};
