/** @jsxImportSource react */
import type { APIRoute } from "astro";
import { ImageResponse } from "@vercel/og";

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
  // Fontsource CDN — Instrument Serif Regular
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-normal.woff",
  );
  cachedSerif = await res.arrayBuffer();
  return cachedSerif;
}

async function loadSans(): Promise<ArrayBuffer> {
  if (cachedSans) return cachedSans;
  // Fontsource CDN — Inter 500
  const res = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.woff",
  );
  cachedSans = await res.arrayBuffer();
  return cachedSans;
}

export const GET: APIRoute = async ({ url }) => {
  const params = url.searchParams;
  const title = (params.get("title") ?? "Daniel Nates").slice(0, 90);
  const kicker = (params.get("kicker") ?? "").slice(0, 60);
  const sig = (params.get("sig") ?? "").slice(0, 90);
  const brand = params.get("brand") ?? "daniel";
  const meta = (params.get("meta") ?? "danielnates.com").slice(0, 80);

  const accent = BRAND_COLORS[brand] ?? BRAND_COLORS.daniel;

  const [serifFont, sansFont] = await Promise.all([loadSerif(), loadSans()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: INK,
          color: BONE,
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "Inter",
        }}
      >
        {/* Brand bullet + name (top-left) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: "Inter",
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: accent,
              boxShadow: `0 0 0 5px ${accent}29`,
            }}
          />
          <div>Daniel Nates</div>
        </div>

        {/* Top hairline */}
        <div
          style={{
            position: "absolute",
            top: 132,
            left: 80,
            right: 80,
            height: 1,
            background: HAIRLINE,
          }}
        />

        {/* Center stack: kicker, title, signature */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingTop: 40,
          }}
        >
          {kicker ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                fontFamily: "Inter",
                fontSize: 16,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: MUTED,
                marginBottom: 32,
              }}
            >
              <div style={{ width: 40, height: 1, background: HAIRLINE }} />
              <div>{kicker}</div>
            </div>
          ) : null}

          <div
            style={{
              fontFamily: "Instrument Serif",
              fontSize: 124,
              lineHeight: 1.0,
              letterSpacing: -3,
              color: BONE,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>

          {sig ? (
            <div
              style={{
                fontFamily: "Instrument Serif",
                fontStyle: "italic",
                fontSize: 30,
                lineHeight: 1.4,
                color: "rgba(244,239,230,.78)",
                marginTop: 28,
                maxWidth: 800,
              }}
            >
              {sig}
            </div>
          ) : null}
        </div>

        {/* Bottom hairline */}
        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 80,
            right: 80,
            height: 1,
            background: HAIRLINE,
          }}
        />

        {/* Footer row: meta + url */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "Inter",
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
          }}
        >
          <div>{meta}</div>
          <div>danielnates.com</div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        {
          name: "Instrument Serif",
          data: serifFont,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: sansFont,
          weight: 500,
          style: "normal",
        },
      ],
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
  );
};
