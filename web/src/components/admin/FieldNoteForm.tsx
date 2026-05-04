import { useState } from "react";

type Lang = "es" | "en";
type Category = "ingredient" | "territory" | "technique" | "influence";

export interface FieldNoteValue {
  id?: string;
  title: string;
  date: string;
  category: Category | null;
  body_es: string | null;
  body_en: string | null;
  external_link: string | null;
  published: boolean;
}

interface Props { initial?: Partial<FieldNoteValue>; isNew?: boolean }

const CATEGORY_LABELS: Record<Category, string> = {
  ingredient: "Ingrediente",
  territory: "Territorio",
  technique: "Técnica",
  influence: "Influencia",
};

export default function FieldNoteForm({ initial, isNew = false }: Props) {
  const [v, setV] = useState<FieldNoteValue>({
    id: initial?.id,
    title: initial?.title ?? "",
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    category: initial?.category ?? "ingredient",
    body_es: initial?.body_es ?? "",
    body_en: initial?.body_en ?? "",
    external_link: initial?.external_link ?? "",
    published: initial?.published ?? false,
  });
  const [lang, setLang] = useState<Lang>("es");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const set = <K extends keyof FieldNoteValue>(k: K, val: FieldNoteValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  async function save() {
    if (!v.title.trim()) {
      setMsg({ kind: "err", text: "El título es obligatorio." });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(
        v.id ? `/api/admin/field-notes/${v.id}` : "/api/admin/field-notes",
        {
          method: v.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(v),
        },
      );
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setMsg({ kind: "ok", text: "Guardado." });
      if (isNew) window.location.href = `/admin/field-notes/${json.id}`;
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!v.id) return;
    if (!confirm("¿Eliminar esta nota?")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/field-notes/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete error");
      window.location.href = "/admin/field-notes";
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Delete failed" });
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="title">Título</label>
        <input id="title" className="admin__input" value={v.title} onChange={(e) => set("title", e.target.value)} required />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
        <div className="admin__field">
          <label className="admin__label" htmlFor="date">Fecha</label>
          <input id="date" className="admin__input" type="date" value={v.date} onChange={(e) => set("date", e.target.value)} required />
        </div>
        <div className="admin__field">
          <label className="admin__label" htmlFor="category">Categoría</label>
          <select id="category" className="admin__select" value={v.category ?? "ingredient"} onChange={(e) => set("category", e.target.value as Category)}>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin__tabs">
        <button type="button" className={`admin__tab${lang === "es" ? " is-active" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`admin__tab${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Texto</label>
        <textarea
          className="admin__textarea"
          rows={10}
          placeholder={lang === "es" ? "Saltos de línea = nuevos párrafos." : "Line breaks = new paragraphs."}
          value={(lang === "es" ? v.body_es : v.body_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "body_es" : "body_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="external">Link externo (opcional)</label>
        <input id="external" className="admin__input" type="url" value={v.external_link ?? ""} onChange={(e) => set("external_link", e.target.value)} placeholder="https://…" />
      </div>

      <div className="admin__field">
        <label className="admin__label" style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} />
          Publicado
        </label>
      </div>

      <div className="admin__row--actions">
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving} onClick={save}>
          {saving ? "Guardando…" : v.id ? "Guardar cambios" : "Crear nota"}
        </button>
        {v.id ? (
          <button type="button" className="admin__btn admin__btn--danger" disabled={saving} onClick={destroy}>Eliminar</button>
        ) : null}
        <a className="admin__btn admin__btn--ghost" href="/admin/field-notes">Cancelar</a>
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
