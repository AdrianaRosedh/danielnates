import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { access, refresh } = (await request.json().catch(() => ({}))) as {
    access?: string;
    refresh?: string;
  };
  if (!access || !refresh) return new Response("bad request", { status: 400 });

  const headers = new Headers({ "content-type": "application/json" });
  const opts = "Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000";
  headers.append("Set-Cookie", `sb-access-token=${access}; ${opts}`);
  headers.append("Set-Cookie", `sb-refresh-token=${refresh}; ${opts}`);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
