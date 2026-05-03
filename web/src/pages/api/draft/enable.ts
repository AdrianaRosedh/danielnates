import type { APIRoute } from "astro";
import { DRAFT_COOKIE } from "../../../lib/sanity";

export const prerender = false;

export const GET: APIRoute = ({ url, cookies, redirect }) => {
  const secret = url.searchParams.get("secret");
  const expected = import.meta.env.SANITY_PREVIEW_SECRET;

  if (!expected || secret !== expected) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  cookies.set(DRAFT_COOKIE, "on", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
    maxAge: 60 * 60, // 1h
  });

  const target = url.searchParams.get("redirect") || "/";
  return redirect(target, 307);
};
