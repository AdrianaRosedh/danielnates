import { Field, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { MarqueeBlock } from "../../../lib/types";

export default function MarqueeEditor({ block, onChange }: BlockEditorProps<MarqueeBlock>) {
  return (
    <Row cols="1fr 160px">
      <Field label="Texto"><TextInput value={block.text} onChange={(v) => onChange({ ...block, text: v })} placeholder="Olivea · Fritanguita · Estudio …" /></Field>
      <Field label="Velocidad">
        <Select value={block.speed ?? "medium"} onChange={(v) => onChange({ ...block, speed: v })}
          options={[{ value: "slow", label: "Lenta" }, { value: "medium", label: "Media" }, { value: "fast", label: "Rápida" }]} />
      </Field>
    </Row>
  );
}
