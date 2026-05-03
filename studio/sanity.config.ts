import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";
import { structure } from "./structure";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET;

if (!projectId) throw new Error("Missing env: SANITY_STUDIO_PROJECT_ID");
if (!dataset) throw new Error("Missing env: SANITY_STUDIO_DATASET");

const previewUrl =
  process.env.SANITY_STUDIO_PREVIEW_URL ?? "http://localhost:4321";
const previewSecret = process.env.SANITY_STUDIO_PREVIEW_SECRET ?? "";

export default defineConfig({
  name: "danielnates-studio",
  title: "Daniel Nates",
  projectId,
  dataset,
  plugins: [
    structureTool({ structure }),
    presentationTool({
      previewUrl: {
        origin: previewUrl,
        preview: "/",
        previewMode: {
          enable: `/api/draft/enable?secret=${encodeURIComponent(previewSecret)}`,
          disable: "/api/draft/disable",
        },
      },
      resolve: {
        locations: {
          project: {
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) =>
              doc?.slug
                ? { locations: [{ title: doc.title ?? doc.slug, href: `/${doc.slug}` }] }
                : undefined,
          },
          article: {
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) =>
              doc?.slug
                ? { locations: [{ title: doc.title ?? doc.slug, href: `/diario/${doc.slug}` }] }
                : undefined,
          },
          artPiece: {
            select: { title: "title", slug: "slug.current" },
            resolve: (doc) =>
              doc?.slug
                ? { locations: [{ title: doc.title ?? doc.slug, href: `/arte/${doc.slug}` }] }
                : undefined,
          },
        },
      },
    }),
    visionTool(),
  ],
  schema: { types: schemaTypes },
});
