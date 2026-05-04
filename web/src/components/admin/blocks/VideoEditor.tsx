import { Checkbox, Field, ImageInput, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { VideoBlock } from "../../../lib/types";

export default function VideoEditor({ block, onChange }: BlockEditorProps<VideoBlock>) {
  const set = <K extends keyof VideoBlock>(k: K, v: VideoBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Field label="URL del video" hint="Sube a Storage o pega URL externa (mp4, webm)"><TextInput type="url" value={block.videoUrl} onChange={(v) => set("videoUrl", v)} placeholder="https://…" /></Field>
      <Field label="Poster (frame de portada)"><ImageInput value={block.poster_url} onChange={(v) => set("poster_url", v)} folder="video-posters" /></Field>
      <Row cols="1fr 1fr 200px">
        <Field><Checkbox value={block.autoplay} onChange={(v) => set("autoplay", v)} label="Autoplay" /></Field>
        <Field><Checkbox value={block.loop} onChange={(v) => set("loop", v)} label="Loop" /></Field>
        <Field label="Ancho">
          <Select value={block.layout ?? "inline"} onChange={(v) => set("layout", v)}
            options={[{ value: "inline", label: "En columna" }, { value: "full", label: "Ancho completo" }, { value: "bleed", label: "Bleed" }]} />
        </Field>
      </Row>
      <Field label="Caption"><TextInput value={block.caption} onChange={(v) => set("caption", v)} placeholder="Texto al pie (opcional)" /></Field>
    </>
  );
}
