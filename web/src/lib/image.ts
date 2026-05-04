/**
 * Image helper. Pre-Supabase migration this wrapped Sanity's URL builder;
 * now images are direct URLs from Supabase Storage so this is a thin
 * passthrough that accepts either a URL string or `null`.
 *
 * Kept as a function so existing component imports keep working.
 */
export function img(source: string | null | undefined): string | null {
  return source ?? null;
}

export function imgSrcset(): string | null {
  // Could be wired to Vercel Image API later for srcset variants.
  return null;
}
