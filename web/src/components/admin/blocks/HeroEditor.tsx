import { Field, ImageInput, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { HeroBlock } from "../../../lib/types";

export default function HeroEditor({ block, onChange }: BlockEditorProps<HeroBlock>) {
  const set = <K extends keyof HeroBlock>(k: K, v: HeroBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Row cols="1fr 200px">
        <Field label="Eyebrow (kicker)"><TextInput value={block.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Capítulo 01" /></Field>
        <Field label="Tono">
          <Select value={block.tone ?? "cinematic"} onChange={(v) => set("tone", v)}
            options={[{ value: "cinematic", label: "Cinematográfico" }, { value: "clean", label: "Limpio" }, { value: "marquee", label: "Marquesina" }]} />
        </Field>
      </Row>
      <Field label="Título"><TextInput value={block.title} onChange={(v) => set("title", v)} placeholder="Una sola línea, peso editorial" /></Field>
      <Field label="Subtítulo"><TextInput value={block.subtitle} onChange={(v) => set("subtitle", v)} placeholder="Una frase de apoyo" /></Field>
      <Field label="Imagen de fondo (opcional)"><ImageInput value={block.image_url} onChange={(v) => set("image_url", v)} folder="hero" /></Field>
      <Field label="Video de fondo URL (opcional)" hint="Sobrescribe la imagen si está presente"><TextInput type="url" value={block.videoUrl} onChange={(v) => set("videoUrl", v)} placeholder="https://…" /></Field>
    </>
  );
}
