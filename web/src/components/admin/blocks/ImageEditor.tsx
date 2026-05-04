import { Field, ImageInput, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { ImageBlockData } from "../../../lib/types";

export default function ImageEditor({ block, onChange }: BlockEditorProps<ImageBlockData>) {
  const set = <K extends keyof ImageBlockData>(k: K, v: ImageBlockData[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Field label="Imagen"><ImageInput value={block.image_url} onChange={(v) => set("image_url", v)} folder="images" /></Field>
      <Row>
        <Field label="Alt (descripción)"><TextInput value={block.alt} onChange={(v) => set("alt", v)} placeholder="Descripción para accesibilidad" /></Field>
        <Field label="Ancho">
          <Select value={block.layout ?? "inline"} onChange={(v) => set("layout", v)}
            options={[{ value: "inline", label: "En columna" }, { value: "full", label: "Ancho completo" }, { value: "bleed", label: "Bleed" }]} />
        </Field>
      </Row>
      <Field label="Caption"><TextInput value={block.caption} onChange={(v) => set("caption", v)} placeholder="Texto al pie (opcional)" /></Field>
    </>
  );
}
