import { useState } from "react";
import { BilingualTabs, Field, ImageInput, PortableTextArea, Row, Select, TextInput, type BlockEditorProps } from "./_shared";
import type { SplitBlock } from "../../../lib/types";

export default function SplitEditor({ block, onChange }: BlockEditorProps<SplitBlock>) {
  const [lang, setLang] = useState<"es" | "en">("es");
  const set = <K extends keyof SplitBlock>(k: K, v: SplitBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Row cols="200px 1fr">
        <Field label="Orientación">
          <Select value={block.orientation ?? "media-left"} onChange={(v) => set("orientation", v)}
            options={[{ value: "media-left", label: "Medio · Texto" }, { value: "media-right", label: "Texto · Medio" }]} />
        </Field>
        <Field label="Eyebrow"><TextInput value={block.eyebrow} onChange={(v) => set("eyebrow", v)} placeholder="Sección · Capítulo" /></Field>
      </Row>
      <Field label="Imagen"><ImageInput value={block.image_url} onChange={(v) => set("image_url", v)} folder="split" /></Field>
      <Field label="O video URL (sobrescribe imagen)"><TextInput type="url" value={block.videoUrl} onChange={(v) => set("videoUrl", v)} placeholder="https://…" /></Field>

      <BilingualTabs lang={lang} onChange={setLang} />
      <Field label={lang === "es" ? "Encabezado · ES" : "Heading · EN"}>
        <TextInput
          value={lang === "es" ? block.heading_es : block.heading_en}
          onChange={(v) => set(lang === "es" ? "heading_es" : "heading_en", v)}
        />
      </Field>
      <Field label={lang === "es" ? "Cuerpo · ES" : "Body · EN"}>
        <PortableTextArea
          value={lang === "es" ? block.body_es : block.body_en}
          onChange={(v) => set(lang === "es" ? "body_es" : "body_en", v ?? [])}
          rows={6}
        />
      </Field>
    </>
  );
}
