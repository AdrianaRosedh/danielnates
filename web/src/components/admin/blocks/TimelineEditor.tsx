import { Field, ItemList, Row, Textarea, TextInput, type BlockEditorProps } from "./_shared";
import type { TimelineBlock } from "../../../lib/types";

type Entry = NonNullable<TimelineBlock["entries"]>[number];

export default function TimelineEditor({ block, onChange }: BlockEditorProps<TimelineBlock>) {
  return (
    <>
      <Field label="Título (opcional)"><TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} placeholder="Trayectoria" /></Field>
      <Field label="Entradas">
        <ItemList<Entry>
          items={block.entries ?? []}
          onChange={(next) => onChange({ ...block, entries: next })}
          addLabel="Añadir entrada"
          factory={() => ({ year: "", label: "", note_es: "", note_en: "" })}
          renderItem={(e, _i, set) => (
            <>
              <Row cols="120px 1fr">
                <Field label="Año"><TextInput value={e.year} onChange={(v) => set({ ...e, year: v })} placeholder="2018" /></Field>
                <Field label="Etiqueta"><TextInput value={e.label} onChange={(v) => set({ ...e, label: v })} placeholder="Maizal · Puebla" /></Field>
              </Row>
              <Row>
                <Field label="Nota · ES"><Textarea rows={2} value={e.note_es ?? ""} onChange={(v) => set({ ...e, note_es: v })} /></Field>
                <Field label="Nota · EN"><Textarea rows={2} value={e.note_en ?? ""} onChange={(v) => set({ ...e, note_en: v })} /></Field>
              </Row>
            </>
          )}
        />
      </Field>
    </>
  );
}
