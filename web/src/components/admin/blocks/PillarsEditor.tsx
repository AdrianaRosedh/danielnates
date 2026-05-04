import { Field, ItemList, Row, Textarea, TextInput, type BlockEditorProps } from "./_shared";
import type { PillarsBlock } from "../../../lib/types";
import type { Pillar } from "../../../lib/types";

export default function PillarsEditor({ block, onChange }: BlockEditorProps<PillarsBlock>) {
  return (
    <>
      <Field label="Kicker (opcional)"><TextInput value={block.kicker} onChange={(v) => onChange({ ...block, kicker: v })} placeholder="Cómo trabaja" /></Field>
      <Field label="Pilares">
        <ItemList<Pillar>
          items={block.pillars ?? []}
          onChange={(next) => onChange({ ...block, pillars: next })}
          addLabel="Añadir pilar"
          factory={() => ({ label: "", copy_es: "", copy_en: "" })}
          renderItem={(p, _i, set) => (
            <>
              <Field label="Etiqueta"><TextInput value={p.label} onChange={(v) => set({ ...p, label: v })} placeholder="Producto" /></Field>
              <Row>
                <Field label="Copy · ES"><Textarea rows={3} value={p.copy_es ?? ""} onChange={(v) => set({ ...p, copy_es: v })} /></Field>
                <Field label="Copy · EN"><Textarea rows={3} value={p.copy_en ?? ""} onChange={(v) => set({ ...p, copy_en: v })} /></Field>
              </Row>
            </>
          )}
        />
      </Field>
    </>
  );
}
