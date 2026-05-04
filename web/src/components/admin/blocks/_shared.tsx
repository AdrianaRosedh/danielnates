/**
 * Shared primitives for the block editors.
 *
 * Every block editor receives `{ block, onChange }` and renders a flat
 * column of admin form controls. These primitives keep the per-block
 * files small and visually consistent.
 */
import { useRef, useState, type ReactNode } from "react";
import { blocksToText, textToBlocks } from "../../../lib/admin-helpers";
import type { PortableTextBlock } from "@portabletext/types";

export interface BlockEditorProps<T> {
  block: T;
  onChange: (next: T) => void;
}

/* ── Text inputs ──────────────────────────────────────────────────── */

export function Field({ label, hint, children }: { label?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="admin__field">
      {label ? <label className="admin__label">{label}</label> : null}
      {children}
      {hint ? <p className="admin__hint">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: { value?: string; onChange: (v: string) => void; placeholder?: string; type?: "text" | "url" | "number" }) {
  return (
    <input
      className="admin__input"
      type={props.type ?? "text"}
      value={props.value ?? ""}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  );
}

export function NumberInput(props: { value?: number; onChange: (v: number | undefined) => void; placeholder?: string; min?: number; max?: number; step?: number }) {
  return (
    <input
      className="admin__input"
      type="number"
      value={props.value ?? ""}
      onChange={(e) => props.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      placeholder={props.placeholder}
      min={props.min}
      max={props.max}
      step={props.step}
    />
  );
}

export function Textarea(props: { value?: string; onChange: (v: string) => void; rows?: number; placeholder?: string; maxLength?: number }) {
  return (
    <textarea
      className="admin__textarea"
      rows={props.rows ?? 4}
      maxLength={props.maxLength}
      value={props.value ?? ""}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
    />
  );
}

export function Select<T extends string>(props: { value?: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <select className="admin__select" value={props.value ?? props.options[0]?.value} onChange={(e) => props.onChange(e.target.value as T)}>
      {props.options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Checkbox(props: { value?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="admin__check">
      <input type="checkbox" checked={Boolean(props.value)} onChange={(e) => props.onChange(e.target.checked)} />
      <span>{props.label}</span>
    </label>
  );
}

/* ── Portable Text (textarea-backed) ──────────────────────────────── */

export function PortableTextArea(props: { value?: PortableTextBlock[] | null; onChange: (v: PortableTextBlock[] | null) => void; rows?: number; placeholder?: string }) {
  const [draft, setDraft] = useState(blocksToText(props.value));
  return (
    <textarea
      className="admin__textarea"
      rows={props.rows ?? 6}
      value={draft}
      onChange={(e) => {
        setDraft(e.target.value);
        props.onChange(textToBlocks(e.target.value) as PortableTextBlock[] | null);
      }}
      placeholder={props.placeholder}
    />
  );
}

/* ── Image upload ─────────────────────────────────────────────────── */

export function ImageInput(props: { value?: string | null; onChange: (url: string | null) => void; folder?: string; aspect?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", props.folder ?? "blocks");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { url: string };
      props.onChange(json.url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (props.value) {
    return (
      <div className="admin__imagePreview" style={{ aspectRatio: props.aspect }}>
        <img src={props.value} alt="" />
        <button type="button" className="admin__imageRemove" aria-label="Quitar" onClick={() => props.onChange(null)}>×</button>
      </div>
    );
  }
  return (
    <div
      className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
      onClick={() => fileRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) void upload(file);
      }}
    >
      {uploading ? "Subiendo…" : "Haz clic o suelta una imagen"}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) void upload(file);
      }} />
    </div>
  );
}

/* ── Bilingual tabs ───────────────────────────────────────────────── */

export function BilingualTabs(props: { lang: "es" | "en"; onChange: (lang: "es" | "en") => void }) {
  return (
    <div className="admin__tabs">
      <button type="button" className={`admin__tab${props.lang === "es" ? " is-active" : ""}`} onClick={() => props.onChange("es")}>ES</button>
      <button type="button" className={`admin__tab${props.lang === "en" ? " is-active" : ""}`} onClick={() => props.onChange("en")}>EN</button>
    </div>
  );
}

/* ── Two-column row ───────────────────────────────────────────────── */

export function Row({ cols = "1fr 1fr", children }: { cols?: string; children: ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: cols, gap: 16 }}>{children}</div>;
}

/* ── Repeating-array helpers ──────────────────────────────────────── */

export function ItemList<T>({ items, onChange, renderItem, addLabel, factory }: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, i: number, set: (next: T) => void) => ReactNode;
  addLabel: string;
  factory: () => T;
}) {
  const set = (i: number, next: T) => onChange(items.map((it, j) => (j === i ? next : it)));
  const add = () => onChange([...items, factory()]);
  const remove = (i: number) => onChange(items.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 12, background: "rgba(244,239,230,.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: ".14em" }}>#{i + 1}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button type="button" className="admin__btn" onClick={() => move(i, -1)} disabled={i === 0} style={{ padding: "0 8px" }}>↑</button>
              <button type="button" className="admin__btn" onClick={() => move(i, 1)} disabled={i === items.length - 1} style={{ padding: "0 8px" }}>↓</button>
              <button type="button" className="admin__btn admin__btn--danger" onClick={() => remove(i)} style={{ padding: "0 10px" }}>×</button>
            </div>
          </div>
          {renderItem(it, i, (next) => set(i, next))}
        </div>
      ))}
      <button type="button" className="admin__btn" onClick={add}>+ {addLabel}</button>
    </div>
  );
}
