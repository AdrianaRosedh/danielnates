// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

const SITE = process.env.PUBLIC_SITE_URL ?? "https://danielnates.com";

export default defineConfig({
  site: SITE,
  output: "server",
  adapter: vercel({
    imageService: true,
    // Allowlist for /_vercel/image (see src/lib/img.ts). Every width
    // requested by SmartImage must appear in `sizes`.
    imagesConfig: {
      sizes: [24, 480, 800, 1200, 1800],
      domains: ["tlrckscaptfbskgxbayc.supabase.co"],
      formats: ["image/avif", "image/webp"],
    },
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
    sitemap({ i18n: { defaultLocale: "es", locales: { es: "es-ES", en: "en-US" } } }),
  ],
});
