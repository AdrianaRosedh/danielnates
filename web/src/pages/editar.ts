import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Daniel's easy door: danielnates.com/editar.
 *
 * Signed-in editors go straight to the home page, where the admin bar
 * already shows. Everyone else goes to the sign-in page; its emailed link
 * lands on /admin, which explains where editing lives.
 *
 * Deliberately not linked from the public site. That isn't a security
 * control (only allowlisted emails ever receive a link); it just keeps a
 * login door out of the visitors' way. The middleware resolves
 * `locals.isAdmin` for this path like any public page.
 */
export const GET: APIRoute = ({ locals }) =>
  new Response(null, {
    status: 302,
    headers: {
      Location: locals.isAdmin ? "/" : "/admin/login",
      "Cache-Control": "private, no-store",
    },
  });
