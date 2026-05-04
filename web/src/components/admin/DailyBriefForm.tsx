import { useState, useRef } from "react";

type Lang = "es" | "en";
export interface DailyBriefValue {
  id?: string;
  date: string;
  image_url: string | null;
  line_es: string | null;
  line_en: string | null;
  place: string | null;
  published: boolean;
}

interface Props {
  initial?: Partial<DailyBriefValue>;
  isNew?: boolean;
}

export default function DailyBriefForm({ initial, isNew = false }: Props) {
  const [v, setV] = useState<DailyBriefValue>({
    id: initial?.id,
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    image_url: initial?.image_url ?? null,
    line_es: initial?.line_es ?? "",
    line_en: initial?.line_en ?? "",
    place: initial?.place ?? "",
    published: initial?.published ?? true,
  });
  const [lang, setLang] = useState<Lang>("es");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof DailyBriefValue>(key: K, val: DailyBriefValue[K]) =>
    setV((s) => ({ ...s, [key]: val }));

  async function uploadImage(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "briefs");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("image_url", json.url);
    } catch (e) {
      const text = e instanceof Error ? e.message : "Upload failed";
      setMsg({ kind: "err", text });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch(
        v.id ? `/api/admin/daily/${v.id}` : "/api/admin/daily",
        {
          method: v.id ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(v),
        },
      );
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setMsg({ kind: "ok", text: "Guardado." });
      if (isNew) {
        // Bounce to the edit page so subsequent saves PATCH the row
        window.location.href = `/admin/daily/${json.id}`;
      }
    } catch (e) {
      const text = e instanceof Error ? e.message : "Save failed";
      setMsg({ kind: "err", text });
    } finally {
      setSaving(false);
    }
  }

  async function destroy() {
    if (!v.id) return;
    if (!confirm("¿Eliminar este brief? No se puede deshacer.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/daily/${v.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete error");
      window.location.href = "/admin/daily";
    } catch (e) {
      const text = e instanceof Error ? e.message : "Delete failed";
      setMsg({ kind: "err", text });
      setSaving(false);
    }
  }

  return (
    <div>
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
        <label className="admin__label">Imagen</label>
        {v.image_url ? (
          <div className="admin__imagePreview">
            <img src={v.image_url} alt="" />
            <button
              type="button"
              className="admin__imageRemove"
              aria-label="Quitar imagen"
              onClick={() => set("image_url", null)}
            >×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); }}
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

      <div className="admin__field">
        <label className="admin__label">Línea</label>
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
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={240}
          placeholder={lang === "es" ? "Una línea sobre el día." : "One line about the day."}
          value={(lang === "es" ? v.line_es : v.line_en) ?? ""}
          onChange={(e) =>
            set(lang === "es" ? "line_es" : "line_en", e.target.value)
          }
        />
        <p className="admin__hint">
          {lang === "es"
            ? "Una sola frase. Concisa, escrita por él."
            : "One sentence. Concise, in his voice."}
        </p>
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="place">Lugar (opcional)</label>
        <input
          id="place"
          className="admin__input"
          type="text"
          value={v.place ?? ""}
          onChange={(e) => set("place", e.target.value)}
          placeholder="Olivea · Fritanguita · Atelier · Casa"
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
        <p className="admin__hint">
          Si está apagado, queda como borrador y no aparece en el sitio.
        </p>
      </div>

      <div className="admin__row--actions">
        <button
          type="button"
          className="admin__btn admin__btn--primary"
          disabled={saving || uploading}
          onClick={save}
        >
          {saving ? "Guardando…" : v.id ? "Guardar cambios" : "Crear brief"}
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
        <a className="admin__btn admin__btn--ghost" href="/admin/daily">Cancelar</a>
        {msg ? (
          <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p>
        ) : null}
      </div>
    </div>
  );
}
