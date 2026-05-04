import { Field, Row, Textarea, TextInput, type BlockEditorProps } from "./_shared";
import type { AudioBlock } from "../../../lib/types";

export default function AudioEditor({ block, onChange }: BlockEditorProps<AudioBlock>) {
  const set = <K extends keyof AudioBlock>(k: K, v: AudioBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Field label="URL del audio"><TextInput type="url" value={block.audioUrl} onChange={(v) => set("audioUrl", v)} placeholder="https://…" /></Field>
      <Row>
        <Field label="Título"><TextInput value={block.title} onChange={(v) => set("title", v)} /></Field>
        <Field label="Caption"><TextInput value={block.caption} onChange={(v) => set("caption", v)} /></Field>
      </Row>
      <Field label="Transcripción (opcional)"><Textarea rows={4} value={block.transcript} onChange={(v) => set("transcript", v)} /></Field>
    </>
  );
}
