import { useRef, useState } from "react";

interface NavItem { label: string; href: string }

export interface SiteSettingsValue {
  site_name: string | null;
  description_es: string | null;
  description_en: string | null;
  default_og_url: string | null;
  navigation: NavItem[];
  footer: { note_es?: string; note_en?: string; links?: { label?: string; href?: string }[] };
}

interface Props { initial?: Partial<SiteSettingsValue> }

export default function SiteSettingsForm({ initial }: Props) {
  const [v, setV] = useState<SiteSettingsValue>({
    site_name: initial?.site_name ?? "Daniel Nates",
    description_es: initial?.description_es ?? "",
    description_en: initial?.description_en ?? "",
    default_og_url: initial?.default_og_url ?? null,
    navigation: initial?.navigation ?? [],
    footer: initial?.footer ?? { note_es: "", note_en: "", links: [] },
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof SiteSettingsValue>(k: K, val: SiteSettingsValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  async function uploadOg(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "og");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("default_og_url", json.url);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  function updateNav(i: number, key: keyof NavItem, val: string) {
    set("navigation", v.navigation.map((n, j) => j === i ? { ...n, [key]: val } : n));
  }
  function removeNav(i: number) { set("navigation", v.navigation.filter((_, j) => j !== i)); }
  function addNav() { set("navigation", [...v.navigation, { label: "", href: "/" }]); }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      setMsg({ kind: "ok", text: "Guardado." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="site_name">Nombre del sitio</label>
        <input
          id="site_name"
          className="admin__input"
          value={v.site_name ?? ""}
          onChange={(e) => set("site_name", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Descripción · ES (SEO por defecto)</label>
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={200}
          value={v.description_es ?? ""}
          onChange={(e) => set("description_es", e.target.value)}
        />
      </div>
      <div className="admin__field">
        <label className="admin__label">Descripción · EN (SEO por defecto)</label>
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={200}
          value={v.description_en ?? ""}
          onChange={(e) => set("description_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Imagen Open Graph (cuando se comparte el sitio)</label>
        {v.default_og_url ? (
          <div className="admin__imagePreview" style={{ maxWidth: 480 }}>
            <img src={v.default_og_url} alt="" />
            <button type="button" className="admin__imageRemove" onClick={() => set("default_og_url", null)} aria-label="Quitar">×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            style={{ maxWidth: 480 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadOg(file);
            }}
          >
            {uploading ? "Subiendo…" : "Subir imagen (1200×630 ideal)"}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadOg(file);
            }} />
          </div>
        )}
        <p className="admin__hint">
          Si está vacío, /og.png genera dinámicamente una tarjeta tipográfica por página.
        </p>
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 8 }}>Navegación (opcional)</h2>
      <p className="admin__hint" style={{ marginBottom: 16 }}>
        Sobrescribe los items del menú principal. Si está vacío, se usa la lista por defecto.
      </p>

      {v.navigation.map((n, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr auto", gap: 10, marginBottom: 10 }}>
          <input className="admin__input" placeholder="Etiqueta" value={n.label} onChange={(e) => updateNav(i, "label", e.target.value)} />
          <input className="admin__input" placeholder="URL (/diario, /sobre…)" value={n.href} onChange={(e) => updateNav(i, "href", e.target.value)} />
          <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeNav(i)} style={{ padding: "0 14px" }}>×</button>
        </div>
      ))}
      <button type="button" className="admin__btn" onClick={addNav}>+ Añadir item</button>

      <div className="admin__row--actions">
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving || uploading} onClick={save}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <a className="admin__btn admin__btn--ghost" href="/" target="_blank" rel="noreferrer">Ver el sitio ↗</a>
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
