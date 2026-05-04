import { useRef, useState } from "react";
import BlocksField from "./BlocksField";
import type { PageBlock, ProjectStatus, VoiceTrack } from "../../lib/types";

type Lang = "es" | "en";

export interface ProjectValue {
  id?: string;
  slug: string;
  title: string;
  status: ProjectStatus | null;
  summary_es: string | null;
  summary_en: string | null;
  hero_image_url: string | null;
  hero_video_url: string | null;
  blocks: PageBlock[];
  links: { label: string; href: string }[];
  voice: VoiceTrack;
  published: boolean;
}

interface Props {
  initial?: Partial<ProjectValue>;
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

export default function ProjectForm({ initial, isNew = false }: Props) {
  const [v, setV] = useState<ProjectValue>({
    id: initial?.id,
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    status: initial?.status ?? "secondary",
    summary_es: initial?.summary_es ?? "",
    summary_en: initial?.summary_en ?? "",
    hero_image_url: initial?.hero_image_url ?? null,
    hero_video_url: initial?.hero_video_url ?? null,
    blocks: initial?.blocks ?? [],
    links: initial?.links ?? [],
    voice: initial?.voice ?? { es: "", en: "", caption: "" },
    published: initial?.published ?? false,
  });
  const [lang, setLang] = useState<Lang>("es");
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProjectValue>(k: K, val: ProjectValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  function onTitleChange(value: string) {
    set("title", value);
    if (autoSlug) set("slug", toSlug(value));
  }

  async function uploadHero(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "projects");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const json = (await res.json()) as { url: string };
      set("hero_image_url", json.url);
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
        v.id ? `/api/admin/projects/${v.id}` : "/api/admin/projects",
        {
          method: v.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(v),
        },
      );
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setMsg({ kind: "ok", text: "Guardado." });
      if (isNew) window.location.href = `/admin/projects/${json.id}`;
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!v.id) return;
    if (!confirm("¿Eliminar este proyecto? No se puede deshacer.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      window.location.href = "/admin/projects";
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Delete failed" });
      setSaving(false);
    }
  }

  function setLink(i: number, k: "label" | "href", val: string) {
    set("links", v.links.map((l, j) => (j === i ? { ...l, [k]: val } : l)));
  }
  function addLink() { set("links", [...v.links, { label: "", href: "" }]); }
  function removeLink(i: number) { set("links", v.links.filter((_, j) => j !== i)); }

  return (
    <div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="title">Título</label>
        <input id="title" className="admin__input" value={v.title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Olivea" required />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 140px", gap: 16 }}>
        <div className="admin__field">
          <label className="admin__label" htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="admin__input"
            value={v.slug}
            onChange={(e) => { setAutoSlug(false); set("slug", toSlug(e.target.value)); }}
            placeholder="olivea"
            required
          />
          <p className="admin__hint">URL: /proyectos/{v.slug || "…"}</p>
        </div>
        <div className="admin__field">
          <label className="admin__label">Estado</label>
          <select className="admin__select" value={v.status ?? "secondary"} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
            <option value="primary">Principal</option>
            <option value="secondary">Secundario</option>
            <option value="past">Pasado</option>
          </select>
        </div>
        <div className="admin__field">
          <label className="admin__label">Publicación</label>
          <label className="admin__check" style={{ height: 38 }}>
            <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} />
            <span>{v.published ? "Publicado" : "Borrador"}</span>
          </label>
        </div>
      </div>

      {/* Hero */}
      <div className="admin__field">
        <label className="admin__label">Imagen de portada</label>
        {v.hero_image_url ? (
          <div className="admin__imagePreview">
            <img src={v.hero_image_url} alt="" />
            <button type="button" className="admin__imageRemove" aria-label="Quitar" onClick={() => set("hero_image_url", null)}>×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            onClick={() => heroFileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadHero(file);
            }}
          >
            {uploading ? "Subiendo…" : "Haz clic o suelta una imagen"}
            <input ref={heroFileRef} type="file" accept="image/*" hidden onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadHero(file);
            }} />
          </div>
        )}
      </div>

      <div className="admin__field">
        <label className="admin__label">Video de portada (URL, opcional)</label>
        <input className="admin__input" type="url" value={v.hero_video_url ?? ""} onChange={(e) => set("hero_video_url", e.target.value || null)} placeholder="https://…" />
      </div>

      {/* Bilingual summary */}
      <div className="admin__tabs">
        <button type="button" className={`admin__tab${lang === "es" ? " is-active" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`admin__tab${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Resumen ({lang.toUpperCase()})</label>
        <textarea
          className="admin__textarea"
          rows={3}
          maxLength={400}
          value={(lang === "es" ? v.summary_es : v.summary_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "summary_es" : "summary_en", e.target.value)}
          placeholder={lang === "es" ? "Una o dos frases que sitúen el proyecto." : "One or two sentences placing the project."}
        />
      </div>

      {/* Links */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 32, marginBottom: 8 }}>Enlaces</h2>
      <p className="admin__hint" style={{ marginBottom: 12 }}>Sitio web, redes, reservaciones — aparecen al pie del proyecto.</p>
      {v.links.map((l, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: 10, marginBottom: 10 }}>
          <input className="admin__input" placeholder="Etiqueta" value={l.label} onChange={(e) => setLink(i, "label", e.target.value)} />
          <input className="admin__input" placeholder="https://…" type="url" value={l.href} onChange={(e) => setLink(i, "href", e.target.value)} />
          <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeLink(i)} style={{ padding: "0 14px" }}>×</button>
        </div>
      ))}
      <button type="button" className="admin__btn" onClick={addLink}>+ Añadir enlace</button>

      {/* Voice */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 32, marginBottom: 8 }}>Voz (audio opcional)</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="admin__field">
          <label className="admin__label">URL · ES</label>
          <input className="admin__input" type="url" value={v.voice.es ?? ""} onChange={(e) => set("voice", { ...v.voice, es: e.target.value })} placeholder="https://…/voz-es.mp3" />
        </div>
        <div className="admin__field">
          <label className="admin__label">URL · EN</label>
          <input className="admin__input" type="url" value={v.voice.en ?? ""} onChange={(e) => set("voice", { ...v.voice, en: e.target.value })} placeholder="https://…/voice-en.mp3" />
        </div>
      </div>
      <div className="admin__field">
        <label className="admin__label">Caption</label>
        <input className="admin__input" value={v.voice.caption ?? ""} onChange={(e) => set("voice", { ...v.voice, caption: e.target.value })} placeholder="Daniel sobre el proyecto, 2024" />
      </div>

      {/* Blocks builder */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 12 }}>Cuerpo de página</h2>
      <BlocksField blocks={v.blocks} onChange={(blocks) => set("blocks", blocks)} />

      {/* Actions */}
      <div className="admin__row--actions" style={{ marginTop: 40 }}>
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving || uploading} onClick={save}>
          {saving ? "Guardando…" : isNew ? "Crear proyecto" : "Guardar cambios"}
        </button>
        {!isNew && v.id ? (
          <a className="admin__btn admin__btn--ghost" href={`/proyectos/${v.slug}`} target="_blank" rel="noreferrer">Ver el proyecto ↗</a>
        ) : null}
        {!isNew && v.id ? (
          <button type="button" className="admin__btn admin__btn--danger" disabled={saving} onClick={destroy}>Eliminar</button>
        ) : null}
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
