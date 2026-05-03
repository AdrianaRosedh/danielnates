import type { MiddlewareHandler } from "astro";
import { getLocaleFromUrl } from "./lib/i18n";

export const onRequest: MiddlewareHandler = async (context, next) => {
  context.locals.locale = getLocaleFromUrl(context.url);
  return next();
};
