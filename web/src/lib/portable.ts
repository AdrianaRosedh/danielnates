/**
 * Portable Text block utilities shared by the renderer and the
 * inline-edit endpoint.
 *
 * The in-place rich editor (EditOverlay) serializes the edited DOM
 * into this block shape on the client; sanitizeBlocks() is the
 * server-side gate that decides what survives into the database:
 * paragraph/h2/h3/blockquote blocks, plain spans, strong/em marks,
 * and http(s)/mailto links. Anything else is dropped.
 */

export type PtSpan = { _type: "span"; _key: string; text: string; marks: string[] };
export type PtMarkDef = { _type: "link"; _key: string; href: string };
export type PtBlock = {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "blockquote";
  children: PtSpan[];
  markDefs: PtMarkDef[];
};

const STYLES = new Set(["normal", "h2", "h3", "blockquote"]);
const DECORATORS = new Set(["strong", "em"]);
const KEY_RE = /^[a-zA-Z0-9_-]{1,40}$/;
const HREF_RE = /^(https?:\/\/|mailto:)/i;

/**
 * Validate + normalize an untrusted block array. Returns null when
 * nothing usable remains (callers treat that as "clear the field").
 */
export function sanitizeBlocks(input: unknown, maxChars = 40_000): PtBlock[] | null {
  if (!Array.isArray(input)) return null;
  const out: PtBlock[] = [];
  let total = 0;

  for (let bi = 0; bi < input.length && bi < 400; bi++) {
    const raw = input[bi] as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object" || raw._type !== "block") continue;

    const style = (STYLES.has(String(raw.style)) ? String(raw.style) : "normal") as PtBlock["style"];

    // Link markDefs — only well-formed http(s)/mailto hrefs survive.
    const defs: PtMarkDef[] = [];
    const defKeys = new Set<string>();
    if (Array.isArray(raw.markDefs)) {
      for (const d of raw.markDefs as Record<string, unknown>[]) {
        if (!d || d._type !== "link") continue;
        const key = typeof d._key === "string" && KEY_RE.test(d._key) ? d._key : null;
        const href = typeof d.href === "string" ? d.href.trim() : "";
        if (!key || defKeys.has(key) || !HREF_RE.test(href) || href.length > 2000) continue;
        defKeys.add(key);
        defs.push({ _type: "link", _key: key, href });
      }
    }

    const children: PtSpan[] = [];
    if (Array.isArray(raw.children)) {
      const rawChildren = raw.children as Record<string, unknown>[];
      for (let si = 0; si < rawChildren.length && si < 200; si++) {
        const c = rawChildren[si];
        if (!c || c._type !== "span" || typeof c.text !== "string") continue;
        total += c.text.length;
        if (total > maxChars) return null;
        const marks: string[] = [];
        if (Array.isArray(c.marks)) {
          for (const m of c.marks as unknown[]) {
            if (typeof m === "string" && (DECORATORS.has(m) || defKeys.has(m))) marks.push(m);
          }
        }
        children.push({ _type: "span", _key: `s${bi}-${si}`, text: c.text, marks });
      }
    }

    if (!children.some((c) => c.text.trim())) continue; // drop empty blocks
    out.push({ _type: "block", _key: `b${bi}`, style, children, markDefs: defs });
  }

  return out.length ? out : null;
}

const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (ch) => ESC[ch]);
}

/**
 * Render blocks to the exact HTML the public renderer and the inline
 * editor share. Marks nest link > strong > em; newlines become <br>.
 * All text is escaped here — safe for set:html.
 */
export function blocksToHtml(blocks: PtBlock[] | null | undefined): string {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((b) => {
      if (b?._type !== "block" || !Array.isArray(b.children)) return "";
      const defs = new Map((b.markDefs ?? []).map((d) => [d._key, d]));
      const inner = b.children
        .map((c) => {
          if (typeof c?.text !== "string") return "";
          let html = escapeHtml(c.text).replace(/\n/g, "<br>");
          const marks = Array.isArray(c.marks) ? c.marks : [];
          if (marks.includes("em")) html = `<em>${html}</em>`;
          if (marks.includes("strong")) html = `<strong>${html}</strong>`;
          const linkKey = marks.find((m) => defs.has(m));
          if (linkKey) {
            // Re-validated at render too: rows written outside the editor
            // (SQL, imports) never reach sanitizeBlocks.
            const raw = String(defs.get(linkKey)!.href ?? "").trim();
            if (HREF_RE.test(raw)) {
              html = `<a href="${escapeHtml(raw)}" target="_blank" rel="noopener noreferrer">${html}</a>`;
            }
          }
          return html;
        })
        .join("");
      if (!inner.trim()) return "";
      const tag = b.style === "h2" || b.style === "h3" || b.style === "blockquote" ? b.style : "p";
      return `<${tag}>${inner}</${tag}>`;
    })
    .filter(Boolean)
    .join("");
}
