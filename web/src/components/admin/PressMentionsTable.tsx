import { useState } from "react";

interface Mention {
  id?: string;
  outlet: string;
  title: string | null;
  url: string;
  date: string | null;
  language: "es" | "en" | null;
}

interface Props { initial: Mention[] }

export default function PressMentionsTable({ initial }: Props) {
  const [rows, setRows] = useState<Mention[]>(initial);
  const [draft, setDraft] = useState<Mention>({
    outlet: "", title: "", url: "", date: "", language: "es",
  });
  const [saving, setSaving] = useState<string | "new" | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function setDraftField<K extends keyof Mention>(k: K, val: Mention[K]) {
    setDraft((d) => ({ ...d, [k]: val }));
  }

  function setRowField(i: number, k: keyof Mention, val: Mention[typeof k]) {
    setRows((rs) => rs.map((r, j) => j === i ? { ...r, [k]: val } : r));
  }

  async function create() {
    if (!draft.outlet.trim() || !draft.url.trim()) {
      setMsg({ kind: "err", text: "Medio y URL son obligatorios." });
      return;
    }
    setSaving("new");
    setMsg(null);
    try {
      const res = await fetch("/api/admin/press", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      const json = (await res.json()) as { id: string };
      setRows((rs) => [{ ...draft, id: json.id }, ...rs]);
      setDraft({ outlet: "", title: "", url: "", date: "", language: "es" });
      setMsg({ kind: "ok", text: "Mención añadida." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(null);
    }
  }

  async function save(i: number) {
    const row = rows[i];
    if (!row.id) return;
    setSaving(row.id);
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/press/${row.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(row),
      });
      if (!res.ok) throw new Error((await res.text()) || "Save error");
      setMsg({ kind: "ok", text: "Guardado." });
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(null);
    }
  }

  async function destroy(i: number) {
    const row = rows[i];
    if (!row.id) return;
    if (!confirm(`¿Eliminar mención de ${row.outlet}?`)) return;
    setSaving(row.id);
    try {
      const res = await fetch(`/api/admin/press/${row.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.text()) || "Delete error");
      setRows((rs) => rs.filter((_, j) => j !== i));
    } catch (e) {
      setMsg({ kind: "err", text: e instanceof Error ? e.message : "Delete failed" });
    } finally {
      setSaving(null);
    }
  }

  return (
    <div>
      {/* New row */}
      <div style={{ border: "1px solid var(--line-2)", borderRadius: 12, padding: 16, marginBottom: 24, background: "#0E0F0C" }}>
        <p className="admin__label" style={{ marginBottom: 12 }}>Añadir mención</p>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 130px 70px auto", gap: 10 }}>
          <input className="admin__input" placeholder="Medio" value={draft.outlet} onChange={(e) => setDraftField("outlet", e.target.value)} />
          <input className="admin__input" placeholder="Título" value={draft.title ?? ""} onChange={(e) => setDraftField("title", e.target.value)} />
          <input className="admin__input" type="url" placeholder="URL" value={draft.url} onChange={(e) => setDraftField("url", e.target.value)} />
          <input className="admin__input" type="date" value={draft.date ?? ""} onChange={(e) => setDraftField("date", e.target.value)} />
          <select className="admin__select" value={draft.language ?? "es"} onChange={(e) => setDraftField("language", e.target.value as "es" | "en")}>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button type="button" className="admin__btn admin__btn--primary" disabled={saving === "new"} onClick={create}>
            {saving === "new" ? "…" : "+ Añadir"}
          </button>
        </div>
      </div>

      {msg ? <p className={`admin__msg admin__msg--${msg.kind}`} style={{ marginBottom: 16 }}>{msg.text}</p> : null}

      {/* Existing rows */}
      {rows.length ? (
        <div style={{ display: "grid", gap: 8 }}>
          {rows.map((r, i) => (
            <div key={r.id ?? i} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 130px 70px auto auto", gap: 10, alignItems: "center" }}>
              <input className="admin__input" value={r.outlet} onChange={(e) => setRowField(i, "outlet", e.target.value)} />
              <input className="admin__input" value={r.title ?? ""} onChange={(e) => setRowField(i, "title", e.target.value)} />
              <input className="admin__input" type="url" value={r.url} onChange={(e) => setRowField(i, "url", e.target.value)} />
              <input className="admin__input" type="date" value={r.date ?? ""} onChange={(e) => setRowField(i, "date", e.target.value)} />
              <select className="admin__select" value={r.language ?? "es"} onChange={(e) => setRowField(i, "language", e.target.value as "es" | "en")}>
                <option value="es">ES</option>
                <option value="en">EN</option>
              </select>
              <button type="button" className="admin__btn" disabled={saving === r.id} onClick={() => save(i)}>
                {saving === r.id ? "…" : "Guardar"}
              </button>
              <button type="button" className="admin__btn admin__btn--danger" disabled={saving === r.id} onClick={() => destroy(i)} style={{ padding: "0 14px" }}>×</button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--text-2)", textAlign: "center", padding: 40 }}>
          Aún no hay menciones de prensa.
        </p>
      )}
    </div>
  );
}
