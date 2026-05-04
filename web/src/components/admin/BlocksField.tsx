/**
 * The block builder: an ordered, drag-droppable list of PageBlocks
 * with an "+ Add block" affordance that opens BlockPicker.
 */
import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { PageBlock } from "../../lib/types";
import { newKey } from "../../lib/blocks-meta";
import BlockEditorRow from "./BlockEditorRow";
import BlockPicker from "./BlockPicker";

interface Props {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
}

export default function BlocksField({ blocks, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function setBlock(i: number, next: PageBlock) {
    onChange(blocks.map((b, j) => (j === i ? next : b)));
  }
  function deleteBlock(i: number) {
    if (!confirm("¿Eliminar este bloque?")) return;
    onChange(blocks.filter((_, j) => j !== i));
  }
  function duplicateBlock(i: number) {
    const src = blocks[i];
    const copy = JSON.parse(JSON.stringify(src)) as PageBlock;
    copy._key = newKey();
    onChange([...blocks.slice(0, i + 1), copy, ...blocks.slice(i + 1)]);
  }
  function add(b: PageBlock) {
    onChange([...blocks, b]);
  }
  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b._key === active.id);
    const newIndex = blocks.findIndex((b) => b._key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div>
      {blocks.length === 0 ? (
        <div className="admin__blocksEmpty">
          <p>Aún no hay bloques.</p>
          <button type="button" className="admin__btn admin__btn--primary" onClick={() => setPickerOpen(true)}>+ Añadir el primer bloque</button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={blocks.map((b) => b._key)} strategy={verticalListSortingStrategy}>
            <div style={{ display: "grid", gap: 12 }}>
              {blocks.map((b, i) => (
                <BlockEditorRow
                  key={b._key}
                  block={b}
                  onChange={(next) => setBlock(i, next)}
                  onDelete={() => deleteBlock(i)}
                  onDuplicate={() => duplicateBlock(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {blocks.length > 0 ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <button type="button" className="admin__btn admin__btn--primary" onClick={() => setPickerOpen(true)}>+ Añadir bloque</button>
        </div>
      ) : null}

      <BlockPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={add} />
    </div>
  );
}
