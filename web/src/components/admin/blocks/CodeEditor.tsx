import { Field, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { CodeBlock } from "../../../lib/types";

export default function CodeEditor({ block, onChange }: BlockEditorProps<CodeBlock>) {
  const set = <K extends keyof CodeBlock>(k: K, v: CodeBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Row>
        <Field label="Lenguaje"><TextInput value={block.language} onChange={(v) => set("language", v)} placeholder="ts" /></Field>
        <Field label="Caption"><TextInput value={block.caption} onChange={(v) => set("caption", v)} placeholder="schema.sql" /></Field>
      </Row>
      <Field label="Código">
        <textarea
          className="admin__textarea"
          rows={10}
          spellCheck={false}
          style={{ fontFamily: "ui-monospace, Menlo, Consolas, monospace", fontSize: 13 }}
          value={block.code ?? ""}
          onChange={(e) => set("code", e.target.value)}
        />
      </Field>
    </>
  );
}
