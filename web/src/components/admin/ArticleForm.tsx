import { useRef, useState } from "react";

type Lang = "es" | "en";

export interface ArticleValue {
  id?: string;
  slug: string;
  title: string;
  date: string;
  cover_url: string | null;
  excerpt_es: string | null;
  excerpt_en: string | null;
  body_es: string | null;       // simple textarea body for v1; block builder later
  body_en: string | null;
  tags: string[];
  published: boolean;
}

interface Props {
  initial?: Partial<ArticleValue>;
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

export default function ArticleForm({ initial, isNew = false }: Props) {
  const [v, setV] = useState<ArticleValue>({
    id: initial?.id,
    slug: initial?.slug ?? "",
    title: initial?.title ?? "",
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    cover_url: initial?.cover_url ?? null,
    excerpt_es: initial?.excerpt_es ?? "",
    excerpt_en: initial?.excerpt_en ?? "",
    body_es: initial?.body_es ?? "",
    body_en: initial?.body_en ?? "",
    tags: initial?.tags ?? [],
    published: initial?.published ?? false,
  });
  const [lang, setLang] = useState<Lang>("es");
  const [autoSlug, setAutoSlug] = useState(!initial?.slug);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagsInput, setTagsInput] = useState(v.tags.join(", "));
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ArticleValue>(key: K, val: ArticleValue[K]) =>
    setV((s) => ({ ...s, [key]: val }));

  function onTitleChange(value: string) {
    set("title", value);
    if (autoSlug) set("slug", toSlug(value));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "articles");
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
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload = { ...v, tags };
      const res = await fetch(
        v.id ? `/api/admin/articles/${v.id}` : "/api/admin/articles",
        {
          method: v.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setMsg({ kind: "ok", text: "Guardado." });
      if (isNew) window.location.href = `/admin/articles/${json.id}`;
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!v.id) return;
    if (!confirm("¿Eliminar esta entrada? No se puede deshacer.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete error");
      window.location.href = "/admin/articles";
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
          placeholder="El huerto en marzo"
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
          placeholder="el-huerto-en-marzo"
          required
        />
        <p className="admin__hint">URL: /diario/{v.slug || "…"}</p>
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="date">Fecha</label>
        <input
          id="date"
          className="admin__input"
          type="date"
          value={v.date}
          onChange={(e) => set("date", e.target.value)}
          required
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Imagen de portada</label>
        {v.cover_url ? (
          <div className="admin__imagePreview">
            <img src={v.cover_url} alt="" />
            <button
              type="button"
              className="admin__imageRemove"
              aria-label="Quitar imagen"
              onClick={() => set("cover_url", null)}
            >×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadImage(file);
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
                if (file) void uploadImage(file);
              }}
            />
          </div>
        )}
      </div>

      <div className="admin__tabs">
        <button
          type="button"
          className={`admin__tab${lang === "es" ? " is-active" : ""}`}
          onClick={() => setLang("es")}
        >ES</button>
        <button
          type="button"
          className={`admin__tab${lang === "en" ? " is-active" : ""}`}
          onClick={() => setLang("en")}
        >EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Resumen</label>
        <textarea
          className="admin__textarea"
          rows={3}
          maxLength={400}
          placeholder={lang === "es" ? "1–2 líneas. Aparece en /diario y como descripción social." : "1–2 lines. Shows on /diario and as social description."}
          value={(lang === "es" ? v.excerpt_es : v.excerpt_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "excerpt_es" : "excerpt_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Cuerpo (texto plano)</label>
        <textarea
          className="admin__textarea"
          rows={14}
          placeholder={lang === "es" ? "Escribe la entrada. Saltos de línea = nuevos párrafos." : "Write the entry. Line breaks = new paragraphs."}
          value={(lang === "es" ? v.body_es : v.body_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "body_es" : "body_en", e.target.value)}
        />
        <p className="admin__hint">
          Editor de bloques rico (imágenes, citas, video) viene en la siguiente iteración.
        </p>
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="tags">Etiquetas (separadas por coma)</label>
        <input
          id="tags"
          className="admin__input"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="huerto, fermento, marzo"
        />
      </div>

      <div className="admin__field">
        <label
          className="admin__label"
          style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}
        >
          <input
            type="checkbox"
            checked={v.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Publicado
        </label>
      </div>

      <div className="admin__row--actions">
        <button
          type="button"
          className="admin__btn admin__btn--primary"
          disabled={saving || uploading}
          onClick={save}
        >
          {saving ? "Guardando…" : v.id ? "Guardar cambios" : "Crear entrada"}
        </button>
        {v.id ? (
          <button
            type="button"
            className="admin__btn admin__btn--danger"
            disabled={saving}
            onClick={destroy}
          >
            Eliminar
          </button>
        ) : null}
        <a className="admin__btn admin__btn--ghost" href="/admin/articles">Cancelar</a>
        {v.id ? (
          <a
            className="admin__btn admin__btn--ghost"
            href={`/diario/${v.slug}`}
            target="_blank"
            rel="noreferrer"
          >Ver en el sitio ↗</a>
        ) : null}
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
