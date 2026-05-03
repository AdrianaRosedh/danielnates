import type { APIRoute } from "astro";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../lib/supabase";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: Record<string, unknown> = {};
  try {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      payload = await request.json();
    } else {
      const form = await request.formData();
      payload = Object.fromEntries(form.entries());
    }
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid body" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();
  const locale = payload.locale === "en" ? "en" : "es";
  const honeypot = String(payload.company ?? "").trim();

  if (honeypot) {
    // Bot: pretend success but discard.
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "content-type": "application/json" },
    });
  }

  if (!name || name.length > 200) return bad("Nombre inválido");
  if (!EMAIL.test(email) || email.length > 320) return bad("Email inválido");
  if (!message || message.length > 5000) return bad("Mensaje inválido");

  if (!isSupabaseConfigured()) {
    console.warn("[contact] supabase not configured — message dropped:", { name, email });
    return new Response(JSON.stringify({ ok: true, persisted: false }), {
      headers: { "content-type": "application/json" },
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return bad("Servidor no configurado");

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
    locale,
    source: clientAddress ?? null,
  });

  if (error) {
    console.error("[contact] supabase insert error:", error);
    return bad("No se pudo guardar tu mensaje");
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
};

function bad(reason: string) {
  return new Response(JSON.stringify({ ok: false, error: reason }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}
