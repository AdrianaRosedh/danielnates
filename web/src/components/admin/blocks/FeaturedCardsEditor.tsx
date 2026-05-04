import { Field, ImageInput, ItemList, Row, Textarea, TextInput, type BlockEditorProps } from "./_shared";
import type { FeaturedCardsBlock } from "../../../lib/types";

type Card = NonNullable<FeaturedCardsBlock["cards"]>[number];

export default function FeaturedCardsEditor({ block, onChange }: BlockEditorProps<FeaturedCardsBlock>) {
  return (
    <>
      <Field label="Título (opcional)"><TextInput value={block.title} onChange={(v) => onChange({ ...block, title: v })} placeholder="Proyectos relacionados" /></Field>
      <Field label="Tarjetas">
        <ItemList<Card>
          items={block.cards ?? []}
          onChange={(next) => onChange({ ...block, cards: next })}
          addLabel="Añadir tarjeta"
          factory={() => ({ title: "", description: "", image_url: null, href: "", tag: "" })}
          renderItem={(c, _i, set) => (
            <>
              <Field label="Imagen"><ImageInput value={c.image_url} onChange={(url) => set({ ...c, image_url: url })} folder="cards" aspect="4 / 5" /></Field>
              <Row cols="1fr 200px">
                <Field label="Título"><TextInput value={c.title} onChange={(v) => set({ ...c, title: v })} /></Field>
                <Field label="Tag"><TextInput value={c.tag} onChange={(v) => set({ ...c, tag: v })} placeholder="Restaurante" /></Field>
              </Row>
              <Field label="Descripción"><Textarea rows={2} value={c.description} onChange={(v) => set({ ...c, description: v })} /></Field>
              <Field label="Enlace"><TextInput type="url" value={c.href} onChange={(v) => set({ ...c, href: v })} placeholder="/proyectos/olivea" /></Field>
            </>
          )}
        />
      </Field>
    </>
  );
}
