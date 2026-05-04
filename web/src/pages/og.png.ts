import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";
import React, { type ReactNode, type CSSProperties } from "react";

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

let cachedSerif: ArrayBuffer | null = null;
let cachedSans: ArrayBuffer | null = null;

async function loadSerif(): Promise<ArrayBuffer> {
  if (cachedSerif) return cachedSerif;
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-normal.woff",
  );
  cachedSerif = await res.arrayBuffer();
  return cachedSerif;
}

async function loadSans(): Promise<ArrayBuffer> {
  if (cachedSans) return cachedSans;
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
  );
  cachedSans = await res.arrayBuffer();
  return cachedSans;
}

/* Compact React.createElement helper — keeps the OG tree readable
 * without needing JSX (which Astro won't register as a page route). */
const h = (tag: string, style: CSSProperties, children: ReactNode | null = null) =>
  React.createElement(tag, { style }, children);

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const title = (params.get("title") ?? "Daniel Nates").slice(0, 90);
  const kicker = (params.get("kicker") ?? "").slice(0, 60);
  const sig = (params.get("sig") ?? "").slice(0, 90);
  const brand = params.get("brand") ?? "daniel";
  const meta = (params.get("meta") ?? "danielnates.com").slice(0, 80);

  const accent = BRAND_COLORS[brand] ?? BRAND_COLORS.daniel;

  const [serifFont, sansFont] = await Promise.all([loadSerif(), loadSans()]);

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

  return new ImageResponse(tree, {
    width: W,
    height: H,
    fonts: [
      { name: "Instrument Serif", data: serifFont, weight: 400, style: "normal" },
      { name: "Inter", data: sansFont, weight: 500, style: "normal" },
    ],
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};
