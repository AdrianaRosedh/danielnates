import { Field, Row, Select, Textarea, TextInput, type BlockEditorProps } from "./_shared";
import type { QuoteBlock } from "../../../lib/types";

export default function QuoteEditor({ block, onChange }: BlockEditorProps<QuoteBlock>) {
  const set = <K extends keyof QuoteBlock>(k: K, v: QuoteBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Field label="Cita"><Textarea value={block.text} rows={3} onChange={(v) => set("text", v)} placeholder="Una frase precisa, sin adornos." /></Field>
      <Row>
        <Field label="Atribución"><TextInput value={block.attribution} onChange={(v) => set("attribution", v)} placeholder="Daniel Nates" /></Field>
        <Field label="Tono">
          <Select value={block.tone ?? "editorial"} onChange={(v) => set("tone", v)}
            options={[{ value: "editorial", label: "Editorial" }, { value: "pull", label: "Pull-quote" }]} />
        </Field>
      </Row>
    </>
  );
}
