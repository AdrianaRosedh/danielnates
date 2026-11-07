import type { APIRoute } from "astro";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

export const prerender = false;

const W = 1200;
const H = 630;

const INK = "#0E0F0C";
const BONE = "#F4EFE6";
const MUTED = "rgba(244,239,230,.55)";
const HAIRLINE = "rgba(244,239,230,.18)";

const BRAND_COLORS: Record<string, string> = {
  olivea: "#5B6E48",
  fritanguita: "#C2452D",
  maizal: "#A8896E",
  daniel: BONE,
};

/* Fonts are pinned (no @latest drift) and only cached on success — a
 * failed fetch used to be cached forever as an empty buffer. */
const FONT_URLS = {
  serif: "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@5.3.0/latin-400-normal.woff",
  sans: "https://cdn.jsdelivr.net/fontsource/fonts/inter@5.3.0/latin-500-normal.woff",
} as const;
const fontCache = new Map<keyof typeof FONT_URLS, Promise<ArrayBuffer>>();

function loadFont(which: keyof typeof FONT_URLS): Promise<ArrayBuffer> {
  const hit = fontCache.get(which);
  if (hit) return hit;
  const pending = fetch(FONT_URLS[which], { signal: AbortSignal.timeout(6_000) }).then((res) => {
    if (!res.ok) throw new Error(`font ${which}: HTTP ${res.status}`);
    return res.arrayBuffer();
  });
  fontCache.set(which, pending);
  pending.catch(() => fontCache.delete(which));
  return pending;
}

/* Satori accepts plain {type, props} element objects — children live
 * inside props.children — so no React dependency is needed. */
type OgStyle = Record<string, string | number>;
type OgEl = { type: string; props: { style?: OgStyle; children?: unknown } };
type OgChild = OgEl | string | null;
const h = (tag: string, style: OgStyle, children: OgChild | OgChild[] | string | null = null): OgEl =>
  ({ type: tag, props: { style, children } });

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const title = (params.get("title") ?? "Daniel Nates").slice(0, 90);
  const kicker = (params.get("kicker") ?? "").slice(0, 60);
  const sig = (params.get("sig") ?? "").slice(0, 90);
  const brandParam = params.get("brand") ?? "daniel";
  // Own-property lookup only — "constructor"/"toString" must not resolve.
  const brand = Object.hasOwn(BRAND_COLORS, brandParam) ? brandParam : "daniel";
  const meta = (params.get("meta") ?? "danielnates.com").slice(0, 80);

  const accent = BRAND_COLORS[brand];

  let serifFont: ArrayBuffer;
  let sansFont: ArrayBuffer;
  try {
    [serifFont, sansFont] = await Promise.all([loadFont("serif"), loadFont("sans")]);
  } catch (err) {
    console.error("[og] font load failed:", err instanceof Error ? err.message : err);
    return new Response("OG image temporarily unavailable", { status: 503, headers: { "retry-after": "60" } });
  }

  /* Brand mark — small bullet + name */
  const brandMark = h(
    "div",
    {
      display: "flex",
      alignItems: "center",
      gap: 14,
      fontFamily: "Inter",
      fontSize: 18,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: MUTED,
    },
    [
      h("div", {
        width: 12,
        height: 12,
        borderRadius: 999,
        background: accent,
        boxShadow: `0 0 0 5px ${accent}29`,
      }),
      h("div", {}, "Daniel Nates"),
    ],
  );

  const topRule = h("div", {
    position: "absolute",
    top: 132,
    left: 80,
    right: 80,
    height: 1,
    background: HAIRLINE,
  });

  const kickerLine = kicker
    ? h(
        "div",
        {
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontFamily: "Inter",
          fontSize: 16,
          letterSpacing: 5,
          textTransform: "uppercase",
          color: MUTED,
          marginBottom: 32,
        },
        [
          h("div", { width: 40, height: 1, background: HAIRLINE }),
          h("div", {}, kicker),
        ],
      )
    : null;

  const titleEl = h(
    "div",
    {
      fontFamily: "Instrument Serif",
      fontSize: 124,
      lineHeight: 1.0,
      letterSpacing: -3,
      color: BONE,
      maxWidth: 1000,
    },
    title,
  );

  const sigEl = sig
    ? h(
        "div",
        {
          fontFamily: "Instrument Serif",
          fontStyle: "italic",
          fontSize: 30,
          lineHeight: 1.4,
          color: "rgba(244,239,230,.78)",
          marginTop: 28,
          maxWidth: 800,
        },
        sig,
      )
    : null;

  const center = h(
    "div",
    {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingTop: 40,
    },
    [kickerLine, titleEl, sigEl],
  );

  const bottomRule = h("div", {
    position: "absolute",
    bottom: 120,
    left: 80,
    right: 80,
    height: 1,
    background: HAIRLINE,
  });

  const footer = h(
    "div",
    {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: "Inter",
      fontSize: 16,
      letterSpacing: 4,
      textTransform: "uppercase",
      color: MUTED,
    },
    [h("div", {}, meta), h("div", {}, "danielnates.com")],
  );

  const tree = h(
    "div",
    {
      width: "100%",
      height: "100%",
      background: INK,
      color: BONE,
      display: "flex",
      flexDirection: "column",
      padding: "72px 80px",
      position: "relative",
      fontFamily: "Inter",
    },
    [brandMark, topRule, center, bottomRule, footer],
  );

  /* satori → SVG, resvg → PNG. (Replaces @vercel/og, whose 1.x Node
   * build cannot load under ESM: "Dynamic require of fs".) */
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], {
    width: W,
    height: H,
    fonts: [
      { name: "Instrument Serif", data: serifFont, weight: 400, style: "normal" },
      { name: "Inter", data: sansFont, weight: 500, style: "normal" },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
