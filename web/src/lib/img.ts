/**
 * Vercel Image Optimization URL builder for runtime images (covers,
 * portraits, uploads in Supabase Storage — anything whose URL comes
 * from the database at request time).
 *
 * Every width requested here MUST be in the `sizes` allowlist of the
 * adapter's imagesConfig in astro.config.mjs, or Vercel returns 400.
 * In dev there is no optimizer — URLs pass through untouched.
 */

export const IMG_WIDTHS = [480, 800, 1200, 1800];
export const LQIP_WIDTH = 24;

export function optimizedSrc(src: string, width: number, quality = 72): string {
  if (!src || src.startsWith("data:") || !import.meta.env.PROD) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export function srcsetFor(src: string, widths: number[] = IMG_WIDTHS, quality = 72): string {
  return widths.map((w) => `${optimizedSrc(src, w, quality)} ${w}w`).join(", ");
}
