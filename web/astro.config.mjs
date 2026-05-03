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
  integrations: [sitemap({ i18n: { defaultLocale: "es", locales: { es: "es-ES", en: "en-US" } } })],
  image: {
    domains: ["cdn.sanity.io"],
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    ssr: {
      // Keep Sanity packages externalized so Node loads their CJS/ESM
      // builds directly. Bundling them via Vite breaks @sanity/image-url v2
      // (its exports map points Vite at the .ts source).
      external: ["@sanity/client", "@sanity/image-url"],
    },
    optimizeDeps: {
      // Pre-bundle for the client/dev server.
      include: ["@sanity/client", "@sanity/image-url"],
    },
  },
});
