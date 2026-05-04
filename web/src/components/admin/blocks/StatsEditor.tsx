import { Field, ItemList, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { StatsBlock } from "../../../lib/types";

type Stat = NonNullable<StatsBlock["stats"]>[number];

export default function StatsEditor({ block, onChange }: BlockEditorProps<StatsBlock>) {
  return (
    <>
      <Field label="Título (opcional)"><TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} placeholder="Cifras clave" /></Field>
      <Field label="Cifras">
        <ItemList<Stat>
          items={block.stats ?? []}
          onChange={(next) => onChange({ ...block, stats: next })}
          addLabel="Añadir cifra"
          factory={() => ({ value: "", label: "", note: "" })}
          renderItem={(s, _i, set) => (
            <Row cols="160px 1fr 1fr">
              <Field label="Valor"><TextInput value={s.value} onChange={(v) => set({ ...s, value: v })} placeholder="★ 1" /></Field>
              <Field label="Etiqueta"><TextInput value={s.label} onChange={(v) => set({ ...s, label: v })} placeholder="Estrella Michelin" /></Field>
              <Field label="Nota"><TextInput value={s.note} onChange={(v) => set({ ...s, note: v })} placeholder="2024" /></Field>
            </Row>
          )}
        />
      </Field>
    </>
  );
}
