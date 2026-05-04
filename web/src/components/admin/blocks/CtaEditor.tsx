import { Field, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { CtaBlock } from "../../../lib/types";

export default function CtaEditor({ block, onChange }: BlockEditorProps<CtaBlock>) {
  const set = <K extends keyof CtaBlock>(k: K, v: CtaBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Row>
        <Field label="Botón primario · etiqueta"><TextInput value={block.label} onChange={(v) => set("label", v)} placeholder="Reservar" /></Field>
        <Field label="Botón primario · URL"><TextInput type="url" value={block.href} onChange={(v) => set("href", v)} placeholder="/reservar" /></Field>
      </Row>
      <Row>
        <Field label="Botón secundario · etiqueta (opcional)"><TextInput value={block.secondaryLabel} onChange={(v) => set("secondaryLabel", v)} placeholder="Ver menú" /></Field>
        <Field label="Botón secundario · URL"><TextInput type="url" value={block.secondaryHref} onChange={(v) => set("secondaryHref", v)} placeholder="/menu" /></Field>
      </Row>
    </>
  );
}
