import type { SanityImage } from "./types";
import { urlFor } from "./sanity";

export interface ImgOpts {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "max" | "min" | "fill" | "fillmax" | "crop" | "clip" | "scale";
}

export function img(source: SanityImage | undefined, opts: ImgOpts = {}): string | null {
  if (!source?.asset?._ref) return null;
  const { width = 1600, height, quality = 85, fit = "max" } = opts;
  let b = urlFor(source).width(width).quality(quality).fit(fit).auto("format");
  if (height) b = b.height(height);
  return b.url();
}

export function imgSrcset(
  source: SanityImage | undefined,
  widths = [480, 768, 1200, 1600, 2400],
): string | null {
  if (!source?.asset?._ref) return null;
  return widths
    .map((w) => `${urlFor(source).width(w).quality(85).auto("format").url()} ${w}w`)
    .join(", ");
}
