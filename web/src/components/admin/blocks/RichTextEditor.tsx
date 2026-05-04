import { Field, PortableTextArea, Select, type BlockEditorProps } from "./_shared";
import type { RichTextBlock } from "../../../lib/types";

export default function RichTextEditor({ block, onChange }: BlockEditorProps<RichTextBlock>) {
  return (
    <>
      <Field label="Ancho de lectura">
        <Select value={block.maxWidth ?? "comfort"} onChange={(v) => onChange({ ...block, maxWidth: v })}
          options={[{ value: "comfort", label: "Cómodo (lectura larga)" }, { value: "editorial", label: "Editorial (más ancho)" }, { value: "full", label: "Ancho completo" }]} />
      </Field>
      <Field label="Cuerpo" hint="Párrafos separados por línea en blanco">
        <PortableTextArea value={block.body} rows={10} placeholder="Escribe…" onChange={(v) => onChange({ ...block, body: v ?? [] })} />
      </Field>
    </>
  );
}
