/**
 * Security primitives shared by every server route and layout.
 *
 * Keep request-derived values (redirect targets, URLs typed into the
 * editor, strings going into <script>) flowing through these helpers —
 * never hand-roll the checks at the call site.
 */

/** Same-origin path for post-login / post-action redirects.
 *  Accepts "/admin", "/sobre?x=1#y"; rejects absolute URLs,
 *  protocol-relative "//evil", "/\\evil", "@evil", control chars. */
export function safeNextPath(raw: string | null | undefined, fallback = "/admin"): string {
  if (!raw) return fallback;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
  try {
    const base = "https://same-origin.invalid";
    const u = new URL(value, base);
    if (u.origin !== base) return fallback;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return fallback;
  }
}

/** Redirect target from a Referer header (absolute URL) — only the path
 *  is kept, and only when it points back at this origin. */
export function safeRefererPath(referer: string | null, origin: string, fallback = "/admin"): string {
  if (!referer) return fallback;
  try {
    const u = new URL(referer);
    if (u.origin !== origin) return fallback;
    return safeNextPath(`${u.pathname}${u.search}${u.hash}`, fallback);
  } catch {
    return fallback;
  }
}

/** JSON that is safe to embed inside an inline <script> (JSON-LD or a
 *  bootstrapping literal): escapes `<`, `>`, `&` and the JS line
 *  terminators so no string can close the tag or break the parser. */
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** Link/asset URL a visitor's browser may follow: http(s), mailto, or a
 *  same-origin path. Everything else (javascript:, data:, vbscript:,
 *  protocol-relative) is refused. */
export function isSafeHref(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const v = raw.trim();
  if (v.length === 0 || v.length > 2000) return false;
  if (v.startsWith("/") && !v.startsWith("//") && !v.startsWith("/\\")) return true;
  return /^(https?:\/\/|mailto:)[^\s]+$/i.test(v);
}

/** Salted, daily-rotating hash of the client IP — enough to rate-limit
 *  bursts without storing the address itself. */
export async function hashClientIp(ip: string | null | undefined, salt = ""): Promise<string | null> {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${salt}|${day}|${ip}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("").slice(0, 40);
}

/** Response headers applied to every SSR response by the middleware.
 *  CSP is limited to directives that don't fight the site's inline
 *  scripts: no framing, no plugins, no <base> hijack, forms post home. */
export function securityHeaders(isProd: boolean): Record<string, string> {
  const csp = [
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
    "form-action 'self'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
  return {
    "Content-Security-Policy": csp,
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    ...(isProd ? { "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload" } : {}),
  };
}
