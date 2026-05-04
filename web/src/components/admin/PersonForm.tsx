import { useRef, useState } from "react";

type Lang = "es" | "en";

interface VoiceShape { es?: string | null; en?: string | null; caption?: string | null }
interface SocialShape { olivea_instagram?: string | null; fritanguita_instagram?: string | null; email?: string | null }
interface PillarShape { label: string; copy_es?: string | null; copy_en?: string | null }

export interface PersonValue {
  name: string | null;
  tagline_es: string | null;
  tagline_en: string | null;
  subline_es: string | null;
  subline_en: string | null;
  portrait_url: string | null;
  bio_short_es: string | null;
  bio_short_en: string | null;
  bio_long_es: string | null;        // textarea — saved as portable-text blocks
  bio_long_en: string | null;
  pillars: PillarShape[];
  social: SocialShape;
  voice: VoiceShape;
}

interface Props {
  initial?: Partial<PersonValue>;
}

export default function PersonForm({ initial }: Props) {
  const [v, setV] = useState<PersonValue>({
    name: initial?.name ?? "Daniel Nates",
    tagline_es: initial?.tagline_es ?? "",
    tagline_en: initial?.tagline_en ?? "",
    subline_es: initial?.subline_es ?? "",
    subline_en: initial?.subline_en ?? "",
    portrait_url: initial?.portrait_url ?? null,
    bio_short_es: initial?.bio_short_es ?? "",
    bio_short_en: initial?.bio_short_en ?? "",
    bio_long_es: initial?.bio_long_es ?? "",
    bio_long_en: initial?.bio_long_en ?? "",
    pillars: initial?.pillars ?? [],
    social: initial?.social ?? { olivea_instagram: "", fritanguita_instagram: "", email: "" },
    voice: initial?.voice ?? { es: "", en: "", caption: "" },
  });
  const [lang, setLang] = useState<Lang>("es");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PersonValue>(k: K, val: PersonValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));
  const setSocial = <K extends keyof SocialShape>(k: K, val: SocialShape[K]) =>
    setV((s) => ({ ...s, social: { ...s.social, [k]: val } }));
  const setVoice = <K extends keyof VoiceShape>(k: K, val: VoiceShape[K]) =>
    setV((s) => ({ ...s, voice: { ...s.voice, [k]: val } }));
  const updatePillar = (i: number, k: keyof PillarShape, val: string) =>
    setV((s) => ({ ...s, pillars: s.pillars.map((p, j) => (j === i ? { ...p, [k]: val } : p)) }));
  const addPillar = () =>
    setV((s) => ({ ...s, pillars: [...s.pillars, { label: "", copy_es: "", copy_en: "" }] }));
  const removePillar = (i: number) =>
    setV((s) => ({ ...s, pillars: s.pillars.filter((_, j) => j !== i) }));

  async function uploadPortrait(file: File) {
    setUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "portraits");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("portrait_url", json.url);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/daniel", {
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
        <label className="admin__label" htmlFor="name">Nombre</label>
        <input
          id="name"
          className="admin__input"
          value={v.name ?? ""}
          onChange={(e) => set("name", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Retrato</label>
        {v.portrait_url ? (
          <div className="admin__imagePreview" style={{ maxWidth: 280 }}>
            <img src={v.portrait_url} alt="" />
            <button
              type="button"
              className="admin__imageRemove"
              aria-label="Quitar imagen"
              onClick={() => set("portrait_url", null)}
            >×</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${uploading ? " is-uploading" : ""}`}
            style={{ maxWidth: 280 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadPortrait(file);
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
                if (file) void uploadPortrait(file);
              }}
            />
          </div>
        )}
      </div>

      <div className="admin__tabs">
        <button type="button" className={`admin__tab${lang === "es" ? " is-active" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`admin__tab${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Tagline (la línea principal)</label>
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={240}
          placeholder={lang === "es" ? "Cocinar y dibujar — la misma lengua." : "To cook and to draw — the same language."}
          value={(lang === "es" ? v.tagline_es : v.tagline_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "tagline_es" : "tagline_en", e.target.value)}
        />
        <p className="admin__hint">Aparece como la frase central del Cold Open y en /sobre.</p>
      </div>

      <div className="admin__field">
        <label className="admin__label">Subline (debajo del nombre)</label>
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={240}
          placeholder={lang === "es" ? "Cocinero en Olivea · Socio en Fritanguita · Dibujante." : "Chef at Olivea · Partner at Fritanguita · Draughtsman."}
          value={(lang === "es" ? v.subline_es : v.subline_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "subline_es" : "subline_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Bio corta (resumen)</label>
        <textarea
          className="admin__textarea"
          rows={4}
          maxLength={1000}
          value={(lang === "es" ? v.bio_short_es : v.bio_short_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "bio_short_es" : "bio_short_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Bio larga (editorial — varios párrafos)</label>
        <textarea
          className="admin__textarea"
          rows={12}
          placeholder="Saltos de línea = nuevos párrafos. Aparece en /sobre."
          value={(lang === "es" ? v.bio_long_es : v.bio_long_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "bio_long_es" : "bio_long_en", e.target.value)}
        />
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 16 }}>Voz (audio)</h2>

      <div className="admin__field">
        <label className="admin__label" htmlFor="voice-es">Audio · ES (URL mp3 / m4a / wav)</label>
        <input
          id="voice-es"
          className="admin__input"
          type="url"
          value={v.voice.es ?? ""}
          onChange={(e) => setVoice("es", e.target.value)}
          placeholder="https://…"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="voice-en">Audio · EN</label>
        <input
          id="voice-en"
          className="admin__input"
          type="url"
          value={v.voice.en ?? ""}
          onChange={(e) => setVoice("en", e.target.value)}
          placeholder="https://…"
        />
      </div>

      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 16 }}>Redes y contacto</h2>

      <div className="admin__field">
        <label className="admin__label" htmlFor="email">Email (público — aparece en footer + /contacto)</label>
        <input
          id="email"
          className="admin__input"
          type="email"
          value={v.social.email ?? ""}
          onChange={(e) => setSocial("email", e.target.value)}
          placeholder="hola@danielnates.com"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="ig1">Instagram · Olivea</label>
        <input
          id="ig1"
          className="admin__input"
          type="url"
          value={v.social.olivea_instagram ?? ""}
          onChange={(e) => setSocial("olivea_instagram", e.target.value)}
          placeholder="https://www.instagram.com/oliveafarmtotable/"
        />
      </div>
      <div className="admin__field">
        <label className="admin__label" htmlFor="ig2">Instagram · Fritanguita</label>
        <input
          id="ig2"
          className="admin__input"
          type="url"
          value={v.social.fritanguita_instagram ?? ""}
          onChange={(e) => setSocial("fritanguita_instagram", e.target.value)}
          placeholder="https://www.instagram.com/fritanguita_/"
        />
      </div>

      {/* Pillars — appear in the Manifesto scene on the home page */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 8 }}>Manifiesto · Pilares</h2>
      <p className="admin__hint" style={{ marginBottom: 16 }}>
        Aparecen como los cuatro pilares del manifiesto en el inicio. Si está vacío, se usan los valores por defecto.
      </p>
      {v.pillars.map((p, i) => (
        <div key={i} style={{ border: "1px solid var(--line-2)", borderRadius: 8, padding: 14, marginBottom: 12, background: "rgba(244,239,230,.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: ".14em" }}>#{i + 1}</span>
            <button type="button" className="admin__btn admin__btn--danger" onClick={() => removePillar(i)} style={{ padding: "0 10px", height: 28, fontSize: 12 }}>Eliminar</button>
          </div>
          <div className="admin__field">
            <label className="admin__label">Etiqueta</label>
            <input className="admin__input" value={p.label} onChange={(e) => updatePillar(i, "label", e.target.value)} placeholder="Producto" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="admin__field">
              <label className="admin__label">Copy · ES</label>
              <textarea className="admin__textarea" rows={3} value={p.copy_es ?? ""} onChange={(e) => updatePillar(i, "copy_es", e.target.value)} placeholder="Una frase, presente, sin adornos." />
            </div>
            <div className="admin__field">
              <label className="admin__label">Copy · EN</label>
              <textarea className="admin__textarea" rows={3} value={p.copy_en ?? ""} onChange={(e) => updatePillar(i, "copy_en", e.target.value)} placeholder="One sentence, present, no flourishes." />
            </div>
          </div>
        </div>
      ))}
      <button type="button" className="admin__btn" onClick={addPillar}>+ Añadir pilar</button>

      <div className="admin__row--actions" style={{ marginTop: 32 }}>
        <button
          type="button"
          className="admin__btn admin__btn--primary"
          disabled={saving || uploading}
          onClick={save}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <a className="admin__btn admin__btn--ghost" href="/" target="_blank" rel="noreferrer">Ver el sitio ↗</a>
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
