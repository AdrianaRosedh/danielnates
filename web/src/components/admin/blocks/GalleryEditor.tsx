import { Field, ImageInput, ItemList, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { GalleryBlock } from "../../../lib/types";

type GalleryImage = NonNullable<GalleryBlock["images"]>[number];

export default function GalleryEditor({ block, onChange }: BlockEditorProps<GalleryBlock>) {
  const images = block.images ?? [];
  return (
    <>
      <Row>
        <Field label="Diseño">
          <Select value={block.layout ?? "grid"} onChange={(v) => onChange({ ...block, layout: v })}
            options={[{ value: "grid", label: "Cuadrícula" }, { value: "strip", label: "Tira horizontal" }, { value: "masonry", label: "Masonería" }]} />
        </Field>
        <Field label="Caption (opcional)"><TextInput value={block.caption} onChange={(v) => onChange({ ...block, caption: v })} placeholder="Conjunto, fecha, lugar…" /></Field>
      </Row>
      <Field label="Imágenes">
        <ItemList<GalleryImage>
          items={images}
          onChange={(next) => onChange({ ...block, images: next })}
          addLabel="Añadir imagen"
          factory={() => ({ url: "" })}
          renderItem={(img, _i, set) => (
            <>
              <ImageInput value={img.url || null} onChange={(url) => set({ ...img, url: url ?? "" })} folder="gallery" />
              <Row>
                <Field label="Alt"><TextInput value={img.alt} onChange={(v) => set({ ...img, alt: v })} /></Field>
                <Field label="Caption"><TextInput value={img.caption} onChange={(v) => set({ ...img, caption: v })} /></Field>
              </Row>
            </>
          )}
        />
      </Field>
    </>
  );
}
