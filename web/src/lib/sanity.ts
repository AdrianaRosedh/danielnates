import { createClient, type ClientConfig, type SanityClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET;
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION ?? "2026-05-03";

if (!projectId) throw new Error("Missing env: PUBLIC_SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing env: PUBLIC_SANITY_DATASET");

const baseConfig: ClientConfig = {
  projectId,
  dataset,
  apiVersion,
  useCdn: import.meta.env.PROD,
  perspective: "published",
};

export const sanity = createClient(baseConfig);

export const DRAFT_COOKIE = "dn_draft";

/** Returns a draft-perspective client when the request has the preview cookie. */
export function getSanity(cookieValue?: string | undefined): SanityClient {
  const token = import.meta.env.SANITY_API_READ_TOKEN;
  if (cookieValue === "on" && token) {
    return createClient({
      ...baseConfig,
      useCdn: false,
      perspective: "drafts",
      token,
      stega: { enabled: false },
    });
  }
  return sanity;
}

const builder = imageUrlBuilder(sanity);
export const urlFor = (source: unknown) => builder.image(source as never);
