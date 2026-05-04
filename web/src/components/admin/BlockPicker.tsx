/**
 * Modal-ish overlay that lists every block type, grouped by category.
 * Click → factory() → onAdd(newBlock).
 */
import { useEffect, useState } from "react";
import { BLOCKS_BY_CATEGORY, CATEGORY_LABELS, type BlockCategory } from "../../lib/blocks-meta";
import type { PageBlock } from "../../lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (block: PageBlock) => void;
}

const ORDER: BlockCategory[] = ["text", "media", "layout", "data", "interactive"];

export default function BlockPicker({ open, onClose, onAdd }: Props) {
  const [filter, setFilter] = useState("");
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  const f = filter.trim().toLowerCase();

  return (
    <div className="admin__pickerScrim" onClick={onClose}>
      <div className="admin__picker" onClick={(e) => e.stopPropagation()}>
        <div className="admin__pickerHead">
          <h3 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22 }}>Añadir bloque</h3>
          <button type="button" className="admin__btn" onClick={onClose} style={{ padding: "0 12px" }}>Cerrar (Esc)</button>
        </div>
        <input
          autoFocus
          className="admin__input"
          placeholder="Buscar tipo de bloque…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <div className="admin__pickerBody">
          {ORDER.map((cat) => {
            const items = BLOCKS_BY_CATEGORY[cat].filter(
              (b) => !f || b.label.toLowerCase().includes(f) || b.hint.toLowerCase().includes(f) || b.type.toLowerCase().includes(f),
            );
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom: 20 }}>
                <p className="admin__pickerCat">{CATEGORY_LABELS[cat]}</p>
                <div className="admin__pickerGrid">
                  {items.map((b) => (
                    <button
                      key={b.type}
                      type="button"
                      className="admin__pickerItem"
                      onClick={() => { onAdd(b.factory()); onClose(); }}
                    >
                      <span className="admin__pickerLabel">{b.label}</span>
                      <span className="admin__pickerHint">{b.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
