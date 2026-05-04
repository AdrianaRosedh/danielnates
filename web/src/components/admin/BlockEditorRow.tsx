/**
 * One row in the block builder: drag handle + collapsible header + body.
 *
 * The body is the per-block editor from blocks/registry.tsx. The row
 * itself is sortable via @dnd-kit/sortable.
 */
import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { PageBlock } from "../../lib/types";
import { BLOCK_BY_TYPE } from "../../lib/blocks-meta";
import { EDITORS } from "./blocks/registry";

interface Props {
  block: PageBlock;
  onChange: (next: PageBlock) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export default function BlockEditorRow({ block, onChange, onDelete, onDuplicate }: Props) {
  const meta = BLOCK_BY_TYPE[block._type];
  const Editor = EDITORS[block._type];
  const [open, setOpen] = useState(true);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block._key,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="admin__block"
    >
      <div className="admin__blockHead">
        <button
          type="button"
          className="admin__blockHandle"
          aria-label="Mover"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <button
          type="button"
          className="admin__blockToggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className="admin__blockType">{meta?.label ?? block._type}</span>
          <span className="admin__blockChev">{open ? "▾" : "▸"}</span>
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button type="button" className="admin__btn" style={{ padding: "0 10px", height: 30, fontSize: 12 }} onClick={onDuplicate}>Duplicar</button>
          <button type="button" className="admin__btn admin__btn--danger" style={{ padding: "0 10px", height: 30, fontSize: 12 }} onClick={onDelete}>Eliminar</button>
        </div>
      </div>
      {open ? (
        <div className="admin__blockBody">
          {Editor ? <Editor block={block} onChange={onChange} /> : <p style={{ color: "var(--text-3)" }}>Sin editor para tipo: {block._type}</p>}
        </div>
      ) : null}
    </div>
  );
}
