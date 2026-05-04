import { Field, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { EmbedBlock } from "../../../lib/types";

export default function EmbedEditor({ block, onChange }: BlockEditorProps<EmbedBlock>) {
  return (
    <>
      <Field label="URL del embed" hint="YouTube, Vimeo, Spotify, SoundCloud, etc.">
        <TextInput type="url" value={block.url} onChange={(v) => onChange({ ...block, url: v })} placeholder="https://…" />
      </Field>
      <Row>
        <Field label="Aspecto">
          <Select value={block.aspect ?? "16x9"} onChange={(v) => onChange({ ...block, aspect: v })}
            options={[{ value: "16x9", label: "16 × 9" }, { value: "9x16", label: "9 × 16 (vertical)" }, { value: "1x1", label: "1 × 1 (cuadrado)" }, { value: "4x5", label: "4 × 5" }]} />
        </Field>
        <Field label="Caption"><TextInput value={block.caption} onChange={(v) => onChange({ ...block, caption: v })} /></Field>
      </Row>
    </>
  );
}
