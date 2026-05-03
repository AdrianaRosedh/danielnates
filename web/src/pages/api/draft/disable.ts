import type { APIRoute } from "astro";
import { DRAFT_COOKIE } from "../../../lib/sanity";

export const prerender = false;

export const GET: APIRoute = ({ cookies, redirect, url }) => {
  cookies.delete(DRAFT_COOKIE, { path: "/" });
  const target = url.searchParams.get("redirect") || "/";
  return redirect(target, 307);
};
