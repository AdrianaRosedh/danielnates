import { Field, ItemList, PortableTextArea, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { AccordionBlock } from "../../../lib/types";

type Item = NonNullable<AccordionBlock["items"]>[number];

export default function AccordionEditor({ block, onChange }: BlockEditorProps<AccordionBlock>) {
  return (
    <>
      <Field label="Título (opcional)"><TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} placeholder="Preguntas frecuentes" /></Field>
      <Field label="Items">
        <ItemList<Item>
          items={block.items ?? []}
          onChange={(next) => onChange({ ...block, items: next })}
          addLabel="Añadir pregunta"
          factory={() => ({ q_es: "", q_en: "", a_es: [], a_en: [] })}
          renderItem={(it, _i, set) => (
            <>
              <Row>
                <Field label="Pregunta · ES"><TextInput value={it.q_es} onChange={(v) => set({ ...it, q_es: v })} /></Field>
                <Field label="Pregunta · EN"><TextInput value={it.q_en} onChange={(v) => set({ ...it, q_en: v })} /></Field>
              </Row>
              <Row>
                <Field label="Respuesta · ES"><PortableTextArea value={it.a_es} rows={3} onChange={(v) => set({ ...it, a_es: v ?? [] })} /></Field>
                <Field label="Respuesta · EN"><PortableTextArea value={it.a_en} rows={3} onChange={(v) => set({ ...it, a_en: v ?? [] })} /></Field>
              </Row>
            </>
          )}
        />
      </Field>
    </>
  );
}
