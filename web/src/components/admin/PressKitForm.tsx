import { useRef, useState } from "react";

type Lang = "es" | "en";

interface Photo { url: string; caption?: string | null; credit?: string | null }
interface Recognition { year: string; label: string; org?: string; url?: string }

/* Mentions are managed in the dedicated /admin/press table, not here.
 * The press_kit.mentions jsonb column stays in the schema but is not
 * surfaced in this form to avoid two storage locations for the same
 * conceptual data. */
export interface PressKitValue {
  bio_one_line_es: string | null;
  bio_one_line_en: string | null;
  bio_short_es: string | null;
  bio_short_en: string | null;
  bio_long_es: string | null;       // textarea → blocks
  bio_long_en: string | null;
  photos: Photo[];
  recognitions: Recognition[];
  press_pdf_url: string | null;
  press_email: string | null;
}

interface Props { initial?: Partial<PressKitValue> }

export default function PressKitForm({ initial }: Props) {
  const [v, setV] = useState<PressKitValue>({
    bio_one_line_es: initial?.bio_one_line_es ?? "",
    bio_one_line_en: initial?.bio_one_line_en ?? "",
    bio_short_es: initial?.bio_short_es ?? "",
    bio_short_en: initial?.bio_short_en ?? "",
    bio_long_es: initial?.bio_long_es ?? "",
    bio_long_en: initial?.bio_long_en ?? "",
    photos: initial?.photos ?? [],
    recognitions: initial?.recognitions ?? [],
    press_pdf_url: initial?.press_pdf_url ?? null,
    press_email: initial?.press_email ?? "",
  });
  const [lang, setLang] = useState<Lang>("es");
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof PressKitValue>(k: K, val: PressKitValue[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  async function uploadPhoto(file: File) {
    setPhotoUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "press-photos");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("photos", [...v.photos, { url: json.url, caption: "", credit: "" }]);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setPhotoUploading(false);
    }
  }

  async function uploadPdf(file: File) {
    setPdfUploading(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "press-pdf");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.text()) || "Upload error");
      const json = (await res.json()) as { url: string };
      set("press_pdf_url", json.url);
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Upload failed" });
    } finally {
      setPdfUploading(false);
    }
  }

  function updatePhoto(i: number, key: keyof Photo, val: string) {
    set("photos", v.photos.map((p, j) => j === i ? { ...p, [key]: val } : p));
  }
  function removePhoto(i: number) { set("photos", v.photos.filter((_, j) => j !== i)); }

  function addRecognition() {
    set("recognitions", [...v.recognitions, { year: String(new Date().getFullYear()), label: "", org: "", url: "" }]);
  }
  function updateRecognition(i: number, key: keyof Recognition, val: string) {
    set("recognitions", v.recognitions.map((r, j) => j === i ? { ...r, [key]: val } : r));
  }
  function removeRecognition(i: number) { set("recognitions", v.recognitions.filter((_, j) => j !== i)); }

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/press-kit", {
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
      <div className="admin__tabs">
        <button type="button" className={`admin__tab${lang === "es" ? " is-active" : ""}`} onClick={() => setLang("es")}>ES</button>
        <button type="button" className={`admin__tab${lang === "en" ? " is-active" : ""}`} onClick={() => setLang("en")}>EN</button>
      </div>

      <div className="admin__field">
        <label className="admin__label">Bio · una línea</label>
        <textarea
          className="admin__textarea"
          rows={2}
          maxLength={400}
          value={(lang === "es" ? v.bio_one_line_es : v.bio_one_line_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "bio_one_line_es" : "bio_one_line_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Bio · párrafo</label>
        <textarea
          className="admin__textarea"
          rows={5}
          maxLength={1200}
          value={(lang === "es" ? v.bio_short_es : v.bio_short_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "bio_short_es" : "bio_short_en", e.target.value)}
        />
      </div>

      <div className="admin__field">
        <label className="admin__label">Bio · larga</label>
        <textarea
          className="admin__textarea"
          rows={12}
          placeholder="Saltos de línea = nuevos párrafos."
          value={(lang === "es" ? v.bio_long_es : v.bio_long_en) ?? ""}
          onChange={(e) => set(lang === "es" ? "bio_long_es" : "bio_long_en", e.target.value)}
        />
      </div>

      {/* Photos */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 16 }}>Fotografías (alta resolución)</h2>
      {v.photos.length ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14, marginBottom: 16 }}>
          {v.photos.map((p, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden", background: "#0E0F0C" }}>
              <div style={{ position: "relative" }}>
                <img src={p.url} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block" }} />
                <button type="button" className="admin__imageRemove" onClick={() => removePhoto(i)} aria-label="Quitar">×</button>
              </div>
              <div style={{ padding: "10px 12px 12px", display: "grid", gap: 8 }}>
                <input className="admin__input" placeholder="Pie de foto" value={p.caption ?? ""} onChange={(e) => updatePhoto(i, "caption", e.target.value)} />
                <input className="admin__input" placeholder="Crédito" value={p.credit ?? ""} onChange={(e) => updatePhoto(i, "credit", e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div
        className={`admin__imageDrop${photoUploading ? " is-uploading" : ""}`}
        onClick={() => photoRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void uploadPhoto(file);
        }}
      >
        {photoUploading ? "Subiendo…" : "Añadir foto (clic o arrastra)"}
        <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadPhoto(file);
        }} />
      </div>

      {/* Recognitions */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 16 }}>Reconocimientos</h2>
      {v.recognitions.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr auto", gap: 10, marginBottom: 10 }}>
          <input className="admin__input" placeholder="Año" value={r.year} onChange={(e) => updateRecognition(i, "year", e.target.value)} />
          <input className="admin__input" placeholder="Reconocimiento" value={r.label} onChange={(e) => updateRecognition(i, "label", e.target.value)} />
          <input className="admin__input" placeholder="Otorgado por" value={r.org ?? ""} onChange={(e) => updateRecognition(i, "org", e.target.value)} />
          <input className="admin__input" placeholder="URL (opcional)" value={r.url ?? ""} onChange={(e) => updateRecognition(i, "url", e.target.value)} />
          <button type="button" className="admin__btn admin__btn--danger" onClick={() => removeRecognition(i)} style={{ padding: "0 14px" }}>×</button>
        </div>
      ))}
      <button type="button" className="admin__btn" onClick={addRecognition}>+ Añadir reconocimiento</button>

      <p className="admin__hint" style={{ marginTop: 16 }}>
        Las menciones de prensa se gestionan en <a href="/admin/press" style={{ color: "var(--bone)", borderBottom: "1px solid var(--line-2)" }}>Press menciones</a>.
      </p>

      {/* PDF + email */}
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, marginTop: 40, marginBottom: 16 }}>Kit descargable + contacto</h2>

      <div className="admin__field">
        <label className="admin__label">PDF (kit completo)</label>
        {v.press_pdf_url ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href={v.press_pdf_url} target="_blank" rel="noreferrer" className="admin__btn admin__btn--ghost">📄 Ver PDF actual ↗</a>
            <button type="button" className="admin__btn admin__btn--danger" onClick={() => set("press_pdf_url", null)}>Quitar</button>
          </div>
        ) : (
          <div
            className={`admin__imageDrop${pdfUploading ? " is-uploading" : ""}`}
            onClick={() => pdfRef.current?.click()}
          >
            {pdfUploading ? "Subiendo…" : "Subir PDF"}
            <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadPdf(file);
            }} />
          </div>
        )}
      </div>

      <div className="admin__field">
        <label className="admin__label" htmlFor="press-email">Email de prensa (sobrescribe el de Daniel si se llena)</label>
        <input
          id="press-email"
          className="admin__input"
          type="email"
          value={v.press_email ?? ""}
          onChange={(e) => set("press_email", e.target.value)}
          placeholder="prensa@danielnates.com"
        />
      </div>

      <div className="admin__row--actions">
        <button type="button" className="admin__btn admin__btn--primary" disabled={saving || photoUploading || pdfUploading} onClick={save}>
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        <a className="admin__btn admin__btn--ghost" href="/prensa" target="_blank" rel="noreferrer">Ver /prensa ↗</a>
        {msg ? <p className={`admin__msg admin__msg--${msg.kind}`}>{msg.text}</p> : null}
      </div>
    </div>
  );
}
