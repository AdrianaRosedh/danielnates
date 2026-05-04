// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

const SITE = process.env.PUBLIC_SITE_URL ?? "https://danielnates.com";

export default defineConfig({
  site: SITE,
  output: "server",
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
  }),
  i18n: {
    locales: ["es", "en"],
    defaultLocale: "es",
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    react({ include: ["**/admin/**"] }),
    sitemap({ i18n: { defaultLocale: "es", locales: { es: "es-ES", en: "en-US" } } }),
  ],
});
