import { useRef, useState } from "react";

type Lang = "es" | "en";

export interface ArtPieceValue {
  id?: string;
  slug: string;
  title: string;
  cover_url: string | null;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  statement_es: string | null;
  statement_en: string | null;
  voice: { es?: string | null; en?: string | null; caption?: string | null };
  published: boolean;
}

interface Props {
  initial?: Partial<ArtPieceValue>;
  isNew?: boolean;
}

function toSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default function ArtPieceForm({ initial, isNew = false }: Props) {
  const [v, setV] = useState<ArtPieceValue>({
    id: initial?.id,
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    cover_url: initial?.cover_url ?? null,
    year: initial?.year ?? new Date().getFullYear(),
    medium: initial?.medium ?? "",
    dimensions: initial?.dimensions ?? "",
    statement_es: initial?.statement_es ?? "",
    statement_en: initial?.statement_en ?? "",
    voice: initial?.voice ?? { es: "", en: "", caption: "" },
    published: initial?.published ?? false,
  });
  const [lang, setLang] = useState<Lang>("es");
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArtPieceValue>(k: K, val: ArtPieceValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));
  const setVoice = (k: "es" | "en" | "caption", val: string) =>
    setV((s) => ({ ...s, voice: { ...s.voice, [k]: val } }));

  function onTitleChange(value: string) {
    set("title", value);
    if (autoSlug) set("slug", toSlug(value));
  }

  async function uploadCover(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "art");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("cover_url", json.url);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!v.title.trim() || !v.slug.trim()) {
      setMsg({ kind: "err", text: "Título y slug son obligatorios." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(
        v.id ? `/api/admin/art/${v.id}` : "/api/admin/art",
        {
          method: v.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(v),
        },
      );
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setMsg({ kind: "ok", text: "Guardado." });
      if (isNew) window.location.href = `/admin/art/${json.id}`;
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!v.id) return;
    if (!confirm("¿Eliminar esta pieza? No se puede deshacer.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/art/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete error");
      window.location.href = "/admin/art";
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Delete failed" });
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="title">Título</label>
        <input
          id="title"
          className="admin__input"
          value={v.title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Sin título III"
          required
        />
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="slug">Slug</label>
        <input
          id="slug"
          className="admin__input"
          value={v.slug}
          onChange={(e) => { setAutoSlug(false); set("slug", toSlug(e.target.value)); }}
          placeholder="sin-titulo-iii"
          required
        />
        <p className="admin__hint">URL: /arte/{v.slug || "…"}</p>
      </div>

      <div className="admin__field">
        <label className="admin__label">Imagen principal</label>
        {v.cover_url ? (
          <div className="admin__imagePreview">
            <img src={v.cover_url} alt="" />
            <button type="button" className="admin__imageRemove" aria-label="Quitar imagen" onClick={() => set("cover_url", null)}>×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadCover(file);
            }}
          >
            {uploading ? "Subiendo…" : "Haz clic o suelta una imagen"}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadCover(file);
              }}
            />
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div className="admin__field">
          <label className="admin__label" htmlFor="year">Año</label>
          <input
            id="year"
            className="admin__input"
            type="number"
            value={v.year ?? ""}
            onChange={(e) => set("year", e.target.value ? Number(e.target.value) : null)}
            placeholder={String(new Date().getFullYear())}
            min="1900"
            max="2100"
          />
        </div>
        <div className="admin__field">
          <label className="admin__label" htmlFor="medium">Medio</label>
          <input
            id="medium"
            className="admin__input"
            value={v.medium ?? ""}
            onChange={(e) => set("medium", e.target.value)}
            placeholder="Óleo sobre lienzo"
          />
        </div>
        <div className="admin__field">
          <label className="admin__label" htmlFor="dimensions">Dimensiones</label>
          <input
            id="dimensions"
            className="admin__input"
            value={v.dimensions ?? ""}
            onChange={(e) => set("dimensions", e.target.value)}
            placeholder="60 × 80 cm"
          />
        </div>
      </div>

      <div className="admin__tabs">
        <button type="button" className={`admin__tab${lang === "es" ? " is-active" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`admin__tab${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Statement (texto)</label>
        <textarea
          className="admin__textarea"
          rows={6}
          maxLength={2000}
          placeholder={lang === "es" ? "Por qué la pieza, qué pasaba esa semana, qué intenta decir." : "Why the piece, what was going on that week, what it tries to say."}
          value={(lang === "es" ? v.statement_es : v.statement_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "statement_es" : "statement_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Audio · ES (URL opcional)</label>
        <input className="admin__input" type="url" value={v.voice.es ?? ""} onChange={(e) => setVoice("es", e.target.value)} placeholder="https://…" />
      </div>
      <div className="admin__field">
        <label className="admin__label">Audio · EN (URL opcional)</label>
        <input className="admin__input" type="url" value={v.voice.en ?? ""} onChange={(e) => setVoice("en", e.target.value)} placeholder="https://…" />
      </div>

      <div className="admin__field">
        <label className="admin__label" style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} />
          Publicado
        </label>
      </div>

      <div className="admin__row--actions">
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving || uploading} onClick={save}>
          {saving ? "Guardando…" : v.id ? "Guardar cambios" : "Crear pieza"}
        </button>
        {v.id ? (
          <button type="button" className="admin__btn admin__btn--danger" disabled={saving} onClick={destroy}>
            Eliminar
          </button>
        ) : null}
        <a className="admin__btn admin__btn--ghost" href="/admin/art">Cancelar</a>
        {v.id ? (
          <a className="admin__btn admin__btn--ghost" href={`/arte/${v.slug}`} target="_blank" rel="noreferrer">Ver en el sitio ↗</a>
        ) : null}
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
