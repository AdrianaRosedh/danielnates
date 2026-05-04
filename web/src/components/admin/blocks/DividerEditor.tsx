import { Field, Select, type BlockEditorProps } from "./_shared";
import type { DividerBlock } from "../../../lib/types";

export default function DividerEditor({ block, onChange }: BlockEditorProps<DividerBlock>) {
  return (
    <Field label="Estilo">
      <Select value={block.style ?? "rule"} onChange={(v) => onChange({ ...block, style: v })}
        options={[{ value: "rule", label: "Línea" }, { value: "dot", label: "Punto" }, { value: "space", label: "Espacio en blanco" }]} />
    </Field>
  );
}
