/**
 * Daniel's notebook studies — shared by the landing notebook and any
 * page that wants a drawing to draw itself (see <Sketch>).
 *
 * Each study is a set of SVG strokes in drawing order; AnimationDirector
 * reveals them with a scrubbed self-draw. The pen filter gives the line
 * a hand (wobble) and graphite grain; the wash filter tears and
 * granulates the watercolour pool laid underneath.
 */
/* ────────────────────────────────────────────────────────────────
   SVG line drawings — notebook studies in 24-33 confident strokes
   each. Few lines, long lines: primary contours at 1.2-1.9px, detail
   and shadow ticks at 0.6-0.9px, ordered the way a hand would lay
   them down (contours → secondary forms → details → shadows) so the
   scroll-driven self-draw reads as drawing, not as loading. A gentle
   per-subject feTurbulence + feDisplacementMap filter keeps the ink
   on paper rather than in a vector tool.

   Each sketch is observed, not iconic:
     leaf  → olive branch — leaf pairs along one sweep, three olives
     cazo  → copper cazo — flared rim, loop handles, spoon, steam
     milpa → maíz plant — drooping alternate blades with midribs,
             a husked ear with silk, branched tassel, prop roots
     mano  → a hand in a writing grip, pencil to paper, the line it
             has just drawn trailing from the point
     mesa  → still life on the table: bowl, spoon, sprig, a lime

   To replace any of these with Daniel's own sketches in the future,
   swap the body string for that kind. */


export type SketchKind = "leaf" | "cazo" | "milpa" | "mano" | "mesa";

export const SKETCHES: Record<SketchKind, { viewBox: string; body: string }> = {
  leaf: {
    viewBox: "0 0 200 240",
    body: `<path d="M 62 228 C 72 196, 86 162, 100 132 C 112 106, 128 74, 148 42" stroke-width="1.8"/><path d="M 64 222 C 73 196, 85 166, 97 140" stroke-width="0.8" opacity="0.6"/><path d="M 94 144 C 80 138, 62 128, 48 116" stroke-width="1.4"/><path d="M 94 144 C 82 130, 64 120, 48 116" stroke-width="1.4"/><path d="M 90 139 C 78 132, 64 124, 53 118" stroke-width="0.7"/><path d="M 103 122 C 120 118, 140 112, 154 104" stroke-width="1.4"/><path d="M 103 122 C 122 124, 142 116, 154 104" stroke-width="1.4"/><path d="M 108 121 C 122 119, 138 113, 148 107" stroke-width="0.7"/><path d="M 110 100 C 96 94, 78 84, 64 72" stroke-width="1.4"/><path d="M 110 100 C 98 88, 80 78, 64 72" stroke-width="1.4"/><path d="M 106 95 C 94 88, 80 80, 69 75" stroke-width="0.7"/><path d="M 120 78 C 136 74, 154 68, 168 60" stroke-width="1.4"/><path d="M 120 78 C 138 80, 156 72, 168 60" stroke-width="1.4"/><path d="M 125 77 C 138 75, 152 69, 162 63" stroke-width="0.7"/><path d="M 130 58 C 118 50, 106 40, 94 28" stroke-width="1.4"/><path d="M 130 58 C 120 46, 108 36, 94 28" stroke-width="1.4"/><path d="M 126 53 C 116 45, 106 37, 99 31" stroke-width="0.7"/><path d="M 148 42 C 142 34, 138 26, 136 18" stroke-width="1.2"/><path d="M 148 42 C 154 34, 158 26, 160 18" stroke-width="1.2"/><path d="M 100 130 C 101 137, 101 143, 100 148" stroke-width="0.9"/><path d="M 100 148 C 93 149, 89 156, 91 165 C 93 173, 101 176, 107 171 C 112 166, 111 156, 105 151 C 103 149, 101 148, 100 148" stroke-width="1.5"/><path d="M 96 156 C 95 160, 95 164, 97 167" stroke-width="0.6" opacity="0.7"/><path d="M 118 84 C 120 90, 121 95, 121 100" stroke-width="0.9"/><path d="M 121 100 C 115 101, 111 107, 113 114 C 115 121, 122 123, 127 119 C 131 115, 130 107, 125 103 C 123 101, 122 100, 121 100" stroke-width="1.4"/><path d="M 117 107 C 116 110, 116 113, 118 115" stroke-width="0.6" opacity="0.7"/><path d="M 136 56 C 138 60, 139 64, 139 68" stroke-width="0.8"/><path d="M 139 68 C 135 69, 133 73, 135 78 C 137 82, 142 83, 145 80 C 147 77, 146 72, 143 70 C 141 68, 140 68, 139 68" stroke-width="1.2"/><path d="M 56 232 C 64 230, 72 230, 80 231" stroke-width="0.7" opacity="0.5"/><path d="M 84 233 C 92 231, 100 231, 106 232" stroke-width="0.6" opacity="0.4"/>`,
  },
  cazo: {
    viewBox: "0 0 240 240",
    body: `<path d="M 38 96 C 82 110, 158 110, 202 96" stroke-width="1.9"/><path d="M 38 96 C 82 84, 158 84, 202 96" stroke-width="1.2" opacity="0.6"/><path d="M 38 96 C 31 93, 27 88, 30 83" stroke-width="1.6"/><path d="M 202 96 C 209 93, 213 88, 210 83" stroke-width="1.6"/><path d="M 38 96 C 41 130, 53 158, 78 172" stroke-width="1.9"/><path d="M 202 96 C 199 130, 187 158, 162 172" stroke-width="1.9"/><path d="M 78 172 C 98 181, 142 181, 162 172" stroke-width="1.8"/><path d="M 98 184 C 112 188, 128 188, 142 184" stroke-width="1.1"/><path d="M 30 83 C 17 78, 12 90, 25 97" stroke-width="1.6"/><path d="M 210 83 C 223 78, 228 90, 215 97" stroke-width="1.6"/><path d="M 198 28 C 176 50, 152 74, 132 96" stroke-width="1.7"/><path d="M 201 31 C 179 53, 155 77, 136 99" stroke-width="0.9"/><path d="M 132 96 C 124 92, 114 94, 110 102 C 107 109, 113 116, 122 114 C 130 112, 134 104, 132 96" stroke-width="1.3"/><path d="M 56 110 C 92 121, 148 121, 184 110" stroke-width="0.9" opacity="0.65"/><path d="M 92 70 C 86 58, 95 50, 89 36" stroke-width="0.8" opacity="0.55"/><path d="M 119 64 C 113 52, 122 44, 116 28" stroke-width="0.8" opacity="0.55"/><path d="M 146 70 C 140 58, 149 50, 143 36" stroke-width="0.8" opacity="0.55"/><path d="M 58 122 c 5 3, 10 4, 15 4" stroke-width="0.6" opacity="0.5"/><path d="M 52 138 c 5 3, 10 4, 15 4" stroke-width="0.6" opacity="0.5"/><path d="M 62 154 c 5 3, 10 3, 14 3" stroke-width="0.6" opacity="0.5"/><path d="M 80 166 c 5 2, 10 3, 14 2" stroke-width="0.6" opacity="0.5"/><path d="M 182 122 c -5 3, -10 4, -15 4" stroke-width="0.6" opacity="0.5"/><path d="M 188 138 c -5 3, -10 4, -15 4" stroke-width="0.6" opacity="0.5"/><path d="M 178 154 c -5 3, -10 3, -14 3" stroke-width="0.6" opacity="0.5"/><path d="M 160 166 c -5 2, -10 3, -14 2" stroke-width="0.6" opacity="0.5"/><path d="M 50 100 C 90 110, 150 110, 190 100" stroke-width="0.6" opacity="0.4"/><path d="M 72 196 C 102 202, 138 202, 168 196" stroke-width="0.7" opacity="0.4"/>`,
  },
  milpa: {
    viewBox: "0 0 200 240",
    body: `<path d="M 95 232 C 96 200, 98 168, 99 136 C 100 104, 102 72, 104 40" stroke-width="1.7"/><path d="M 101 232 C 101 200, 102 168, 103 136 C 104 104, 105 72, 106 40" stroke-width="1.1"/><path d="M 96 194 C 78 178, 56 166, 34 166 C 24 166, 16 172, 10 182" stroke-width="1.6"/><path d="M 96 199 C 80 186, 60 176, 38 174 C 26 174, 16 178, 10 182" stroke-width="1.2"/><path d="M 104 158 C 124 140, 148 128, 172 130 C 182 131, 188 138, 192 148" stroke-width="1.6"/><path d="M 104 164 C 124 148, 146 138, 168 138 C 180 139, 187 143, 192 148" stroke-width="1.2"/><path d="M 100 122 C 84 102, 66 88, 46 82 C 36 80, 28 84, 22 92" stroke-width="1.5"/><path d="M 100 128 C 86 110, 68 96, 48 90 C 38 88, 29 90, 22 92" stroke-width="1.1"/><path d="M 104 86 C 118 68, 136 56, 154 54 C 162 54, 168 58, 172 64" stroke-width="1.4"/><path d="M 104 92 C 120 76, 138 64, 156 62 C 164 62, 169 63, 172 64" stroke-width="1.0"/><path d="M 104 56 C 94 44, 82 36, 70 34 C 64 34, 60 37, 57 41" stroke-width="1.2"/><path d="M 104 61 C 94 50, 82 42, 72 41 C 66 41, 61 41, 57 41" stroke-width="0.9"/><path d="M 104 148 C 112 140, 122 126, 126 112 C 127 106, 127 102, 126 98" stroke-width="1.5"/><path d="M 104 148 C 108 136, 112 122, 116 110 C 119 104, 122 100, 126 98" stroke-width="1.3"/><path d="M 108 140 C 113 130, 118 118, 121 108" stroke-width="0.7"/><path d="M 112 143 C 118 133, 122 122, 124 112" stroke-width="0.6" opacity="0.7"/><path d="M 126 98 C 128 92, 132 88, 138 86" stroke-width="0.6"/><path d="M 126 98 C 127 91, 126 86, 128 80" stroke-width="0.6"/><path d="M 126 99 C 130 95, 136 95, 141 97" stroke-width="0.6"/><path d="M 105 40 C 105 30, 106 20, 106 8" stroke-width="1.0"/><path d="M 105 34 C 97 25, 88 22, 80 27" stroke-width="0.8"/><path d="M 105 30 C 112 22, 121 20, 128 25" stroke-width="0.8"/><path d="M 105 26 C 100 18, 94 14, 88 15" stroke-width="0.7"/><path d="M 106 24 C 111 16, 117 13, 123 14" stroke-width="0.7"/><path d="M 95 196 C 76 182, 54 170, 30 170" stroke-width="0.6" opacity="0.6"/><path d="M 105 161 C 126 144, 150 133, 176 135" stroke-width="0.6" opacity="0.6"/><path d="M 99 125 C 84 106, 66 92, 44 86" stroke-width="0.6" opacity="0.6"/><path d="M 66 91 C 64 95, 62 97, 58 98" stroke-width="0.6"/><path d="M 150 133 C 148 136, 147 138, 147 141" stroke-width="0.6"/><path d="M 94 196 C 97 194, 100 194, 103 196" stroke-width="0.9"/><path d="M 98 160 C 100 158, 103 158, 105 160" stroke-width="0.9"/><path d="M 99 124 C 101 122, 104 122, 106 124" stroke-width="0.9"/><path d="M 102 88 C 104 86, 106 86, 108 88" stroke-width="0.8"/><path d="M 96 222 C 92 226, 89 229, 86 233" stroke-width="0.8"/><path d="M 101 222 C 105 226, 108 229, 112 233" stroke-width="0.8"/><path d="M 97 214 C 92 220, 88 226, 84 232" stroke-width="0.7" opacity="0.8"/><path d="M 56 234 C 74 232, 90 233, 95 234" stroke-width="0.8"/><path d="M 107 234 C 120 233, 136 232, 150 234" stroke-width="0.8"/><path d="M 66 238 C 70 237, 74 237, 77 238" stroke-width="0.5" opacity="0.7"/><path d="M 128 238 C 132 237, 136 237, 139 238" stroke-width="0.5" opacity="0.7"/>`,
  },
  mano: {
    viewBox: "0 0 200 240",
    body: `<path d="M 176 58 C 152 81, 129 103, 108 123" stroke-width="1.4"/><path d="M 178 61 C 154 84, 131 106, 110 126" stroke-width="0.9"/><path d="M 176 58 C 177 58, 178 59, 178 61" stroke-width="0.9"/><path d="M 160 104 C 148 108, 136 112, 126 116 C 118 119, 110 122, 104 125 C 98 128, 96 131, 99 134" stroke-width="1.6"/><path d="M 99 134 C 104 136, 112 134, 120 131 C 128 128, 136 128, 144 132" stroke-width="1.1"/><path d="M 160 104 C 168 99, 176 97, 184 100 C 190 102, 195 107, 199 113" stroke-width="1.5"/><path d="M 92 141 C 100 138, 112 138, 124 142 C 132 145, 140 149, 146 152" stroke-width="1.1"/><path d="M 92 141 C 89 145, 92 149, 98 152 C 112 158, 134 160, 152 156" stroke-width="1.7"/><path d="M 84 146 C 77 153, 71 159, 65 164" stroke-width="1.4"/><path d="M 87 149 C 80 156, 74 162, 67 167" stroke-width="0.9"/><path d="M 65 164 C 60 168, 56 172, 52 176 C 56 174, 61 171, 67 167" stroke-width="1.0"/><path d="M 88 156 C 85 161, 88 166, 95 167 C 108 169, 122 169, 136 166" stroke-width="1.3"/><path d="M 126 174 C 132 182, 144 184, 156 180" stroke-width="1.2"/><path d="M 150 186 C 156 192, 166 193, 175 189" stroke-width="1.1"/><path d="M 175 189 C 185 186, 193 180, 199 171" stroke-width="1.2"/><path d="M 152 156 C 160 158, 164 164, 162 170" stroke-width="0.7" opacity="0.7"/><path d="M 94 143 C 97 142, 100 143, 101 146" stroke-width="0.7"/><path d="M 130 115 C 132 117, 133 120, 133 122" stroke-width="0.6"/><path d="M 114 121 C 115 123, 116 126, 116 128" stroke-width="0.6"/><path d="M 168 100 C 170 98, 173 98, 175 100" stroke-width="0.6" opacity="0.8"/><path d="M 180 101 C 182 99, 185 99, 187 102" stroke-width="0.6" opacity="0.8"/><path d="M 112 160 C 116 160, 120 161, 123 163" stroke-width="0.6" opacity="0.7"/><path d="M 193 106 C 188 128, 189 156, 195 182" stroke-width="1.2"/><path d="M 196 140 C 197 146, 198 151, 198 156" stroke-width="0.6" opacity="0.7"/><path d="M 52 176 C 42 182, 30 186, 18 184 C 12 183, 8 181, 6 178" stroke-width="1.1"/><path d="M 6 196 C 50 194, 100 195, 150 197" stroke-width="0.6" opacity="0.5"/>`,
  },
  mesa: {
    viewBox: "0 0 240 200",
    body: `<path d="M 16 142 C 82 137, 162 137, 226 142" stroke-width="1.7"/><path d="M 18 148 C 84 143, 162 143, 224 148" stroke-width="0.9" opacity="0.7"/><path d="M 36 148 C 35 162, 34 175, 34 190" stroke-width="1.2"/><path d="M 206 148 C 207 162, 208 175, 208 190" stroke-width="1.2"/><path d="M 74 100 C 96 111, 138 111, 160 100" stroke-width="1.8"/><path d="M 74 100 C 96 91, 138 91, 160 100" stroke-width="1.0" opacity="0.65"/><path d="M 74 100 C 76 119, 91 131, 117 132 C 143 131, 158 119, 160 100" stroke-width="1.8"/><path d="M 106 133 C 105 136, 104 139, 104 141" stroke-width="1.1"/><path d="M 128 133 C 129 136, 130 139, 130 141" stroke-width="1.1"/><path d="M 100 141 C 108 144, 126 144, 134 141" stroke-width="1.3"/><path d="M 197 56 C 182 70, 166 85, 152 98" stroke-width="1.5"/><path d="M 200 59 C 185 73, 169 88, 155 101" stroke-width="0.85"/><path d="M 152 98 C 144 93, 135 95, 131 102 C 128 108, 133 114, 141 112 C 148 110, 152 105, 152 98" stroke-width="1.25"/><path d="M 104 82 C 99 72, 107 64, 102 52" stroke-width="0.8" opacity="0.55"/><path d="M 126 80 C 121 70, 129 62, 124 50" stroke-width="0.8" opacity="0.55"/><path d="M 176 132 C 187 128, 198 125, 210 121" stroke-width="1.1"/><path d="M 184 130 C 182 124, 184 118, 190 115" stroke-width="0.9"/><path d="M 190 115 C 191 121, 188 127, 184 130" stroke-width="0.8"/><path d="M 194 127 C 193 121, 196 116, 202 113" stroke-width="0.9"/><path d="M 202 113 C 202 119, 199 124, 194 127" stroke-width="0.8"/><path d="M 210 121 C 211 115, 215 111, 221 109" stroke-width="0.9"/><path d="M 221 109 C 220 115, 216 119, 210 121" stroke-width="0.8"/><path d="M 50 121 C 43 121, 38 127, 39 134 C 40 141, 47 144, 53 141 C 59 138, 60 128, 55 124 C 53 122, 51 121, 50 121" stroke-width="1.4"/><path d="M 50 121 C 50 118, 51 116, 53 114" stroke-width="0.8"/><path d="M 86 150 C 102 154, 132 154, 148 150" stroke-width="0.7" opacity="0.4"/><path d="M 42 147 C 47 149, 54 149, 59 147" stroke-width="0.6" opacity="0.4"/><path d="M 180 137 C 190 135, 200 132, 209 129" stroke-width="0.6" opacity="0.4"/>`,
  },
};

/* Watercolour wash — one loose pool of colour per study, laid behind
   the line in the chapter's accent (olive leaf, copper cazo, maize
   ochre, clay, lime). Its own filter tears the edge and granulates the
   pigment; the director fades it in once the line is mostly drawn,
   the way a cook would wash a quick sketch afterwards. */
export const WASHES: Record<SketchKind, { cx: number; cy: number; rx: number; ry: number; rot: number; color: string; opacity: number }> = {
  leaf:  { cx: 108, cy: 128, rx: 34, ry: 86, rot: 28,  color: "#6F8752", opacity: 0.30 },
  cazo:  { cx: 122, cy: 136, rx: 84, ry: 42, rot: -4,  color: "#C2692A", opacity: 0.26 },
  milpa: { cx: 116, cy: 124, rx: 44, ry: 94, rot: 6,   color: "#C9A04E", opacity: 0.30 },
  mano:  { cx: 116, cy: 150, rx: 74, ry: 38, rot: -20, color: "#AE7B4C", opacity: 0.22 },
  mesa:  { cx: 122, cy: 120, rx: 90, ry: 34, rot: -3,  color: "#9AA65A", opacity: 0.28 },
};

/** Inline SVG for a study. `prefix` namespaces the filter ids so two
 *  sets of defs can coexist on one page. */
export function sketchSvg(kind: SketchKind, prefix = "nb"): string {
  const { viewBox, body } = SKETCHES[kind];
  const w = WASHES[kind];
  const wash = `<ellipse data-wash cx="${w.cx}" cy="${w.cy}" rx="${w.rx}" ry="${w.ry}" transform="rotate(${w.rot} ${w.cx} ${w.cy})" opacity="${w.opacity}" style="fill:${w.color};stroke:none" filter="url(#${prefix}-wash-${kind})"/>`;
  return `<svg viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" filter="url(#${prefix}-pen-${kind})">${wash}${body}</svg>`;
}

/* Pen-wobble defs — one filter per sketch kind, each with its own
   seed so the hand reads slightly different on every spread. The
   displacement is small (1.5–2.5px) — a confident hand, not a shaky
   one. Larger margins on the filter region prevent edge clipping. */
const PEN: Record<SketchKind, { freq: number; seed: number; scale: number }> = {
  leaf: { freq: 0.018, seed: 5,  scale: 1.6 },
  cazo: { freq: 0.014, seed: 11, scale: 1.9 },
  milpa: { freq: 0.020, seed: 17, scale: 1.5 },
  mano: { freq: 0.016, seed: 23, scale: 1.8 },
  mesa: { freq: 0.012, seed: 29, scale: 2.0 },
};

/** <filter> markup (pen + wash) for the given studies — drop inside an
 *  SVG <defs>. Ids are `${prefix}-pen-<kind>` / `${prefix}-wash-<kind>`. */
export function sketchDefs(kinds: SketchKind[], prefix = "nb"): string {
  return kinds.map((k) => {
    const f = PEN[k];
    return `<filter id="${prefix}-pen-${k}" x="-10%" y="-10%" width="120%" height="120%">`
      + `<feTurbulence type="fractalNoise" baseFrequency="${f.freq}" numOctaves="2" seed="${f.seed}" result="n"/>`
      + `<feDisplacementMap in="SourceGraphic" in2="n" scale="${f.scale}" result="ink"/>`
      + `<feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="1" seed="${f.seed + 7}" result="tooth"/>`
      + `<feColorMatrix in="tooth" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.4 0 0 0 -0.35" result="grain"/>`
      + `<feComposite in="ink" in2="grain" operator="in"/>`
      + `</filter>`
      + `<filter id="${prefix}-wash-${k}" x="-35%" y="-35%" width="170%" height="170%">`
      + `<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="${f.seed + 3}" result="edge"/>`
      + `<feDisplacementMap in="SourceGraphic" in2="edge" scale="26" xChannelSelector="R" yChannelSelector="G" result="torn"/>`
      + `<feGaussianBlur in="torn" stdDeviation="1.4" result="bleed"/>`
      + `<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="${f.seed + 5}" result="pig"/>`
      + `<feColorMatrix in="pig" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.4 0 0 0 0.05" result="gran"/>`
      + `<feComposite in="bleed" in2="gran" operator="in"/>`
      + `</filter>`;
  }).join("");
}

export const ALL_SKETCHES: SketchKind[] = ["leaf", "cazo", "milpa", "mano", "mesa"];
