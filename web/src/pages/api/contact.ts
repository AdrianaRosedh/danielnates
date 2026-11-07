import type { APIRoute } from "astro";
import { getSupabase } from "../../lib/supabase";
import { hashClientIp } from "../../lib/security";

export const prerender = false;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MESSAGES = {
  es: {
    body: "Solicitud inválida",
    name: "Nombre inválido",
    email: "Email inválido",
    message: "Mensaje inválido",
    rate: "Demasiados mensajes seguidos. Intenta de nuevo en unos minutos.",
    fail: "No se pudo enviar tu mensaje. Intenta de nuevo.",
  },
  en: {
    body: "Invalid request",
    name: "Invalid name",
    email: "Invalid email",
    message: "Invalid message",
    rate: "Too many messages in a row. Please try again in a few minutes.",
    fail: "Couldn't send your message. Please try again.",
  },
} as const;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

/**
 * Contact form → public.submit_contact (validated, rate-limited RPC).
 * Uses the anon client: the database function is the only write path,
 * so the same limits apply to anyone calling the REST API directly.
 * The client IP is stored only as a salted, daily-rotating hash.
 */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  let payload: Record<string, unknown> = {};
  try {
    const ct = request.headers.get("content-type") ?? "";
    const parsed: unknown = ct.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: MESSAGES.es.body }, 400);
  }

  const locale = payload.locale === "en" ? "en" : "es";
  const t = MESSAGES[locale];
  const name = String(payload.name ?? "").trim();
  const email = String(payload.email ?? "").trim();
  const message = String(payload.message ?? "").trim();

  // Honeypot: bots fill the hidden field — pretend success, store nothing.
  if (String(payload.company ?? "").trim()) return json({ ok: true });

  if (!name || name.length > 200) return json({ ok: false, error: t.name }, 400);
  if (!EMAIL.test(email) || email.length > 320) return json({ ok: false, error: t.email }, 400);
  if (!message || message.length > 5000) return json({ ok: false, error: t.message }, 400);

  const supabase = getSupabase();
  if (!supabase) {
    console.error("[contact] Supabase not configured — message dropped");
    return json({ ok: false, error: t.fail }, 503);
  }

  const source = await hashClientIp(clientAddress, import.meta.env.CONTACT_IP_SALT ?? "");
  const { error } = await supabase.rpc("submit_contact", {
    p_name: name,
    p_email: email,
    p_message: message,
    p_locale: locale,
    p_source: source,
  });

  if (error) {
    if (error.message.includes("rate_limited")) return json({ ok: false, error: t.rate }, 429);
    console.error("[contact] submit_contact failed:", error.message);
    return json({ ok: false, error: t.fail }, 500);
  }
  return json({ ok: true });
};
