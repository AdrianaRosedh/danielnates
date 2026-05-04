import { Field, ItemList, NumberInput, PortableTextArea, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { RecipeBlock } from "../../../lib/types";

type Ingredient = NonNullable<RecipeBlock["ingredients"]>[number];

export default function RecipeEditor({ block, onChange }: BlockEditorProps<RecipeBlock>) {
  const meta = block.meta ?? {};
  return (
    <>
      <Field label="Nombre del platillo"><TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} placeholder="Quiltamal de aguacate" /></Field>
      <Row cols="1fr 1fr 1fr">
        <Field label="Tiempo (min)"><NumberInput value={meta.time} onChange={(v) => onChange({ ...block, meta: { ...meta, time: v } })} /></Field>
        <Field label="Porciones"><NumberInput value={meta.servings} onChange={(v) => onChange({ ...block, meta: { ...meta, servings: v } })} /></Field>
        <Field label="Dificultad"><TextInput value={meta.difficulty} onChange={(v) => onChange({ ...block, meta: { ...meta, difficulty: v } })} placeholder="Media" /></Field>
      </Row>
      <Field label="Ingredientes">
        <ItemList<Ingredient>
          items={block.ingredients ?? []}
          onChange={(next) => onChange({ ...block, ingredients: next })}
          addLabel="Añadir ingrediente"
          factory={() => ({ amount: "", item: "", note: "" })}
          renderItem={(ing, _i, set) => (
            <Row cols="120px 1fr 1fr">
              <Field label="Cantidad"><TextInput value={ing.amount} onChange={(v) => set({ ...ing, amount: v })} placeholder="2 cdas" /></Field>
              <Field label="Ingrediente"><TextInput value={ing.item} onChange={(v) => set({ ...ing, item: v })} placeholder="manteca de cerdo" /></Field>
              <Field label="Nota"><TextInput value={ing.note} onChange={(v) => set({ ...ing, note: v })} placeholder="opcional" /></Field>
            </Row>
          )}
        />
      </Field>
      <Field label="Pasos" hint="Un párrafo por paso, separados por línea en blanco">
        <PortableTextArea value={block.steps} rows={8} onChange={(v) => onChange({ ...block, steps: v ?? [] })} />
      </Field>
    </>
  );
}
