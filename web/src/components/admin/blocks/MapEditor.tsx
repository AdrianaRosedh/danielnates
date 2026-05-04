import { Field, NumberInput, Row, TextInput, type BlockEditorProps } from "./_shared";
import type { MapBlock } from "../../../lib/types";

export default function MapEditor({ block, onChange }: BlockEditorProps<MapBlock>) {
  const set = <K extends keyof MapBlock>(k: K, v: MapBlock[K]) => onChange({ ...block, [k]: v });
  return (
    <>
      <Field label="Título"><TextInput value={block.title} onChange={(v) => set("title", v)} placeholder="Olivea · Valle de Guadalupe" /></Field>
      <Field label="Dirección"><TextInput value={block.address} onChange={(v) => set("address", v)} placeholder="Carretera Tecate–Ensenada km 88, Valle de Guadalupe" /></Field>
      <Row cols="1fr 1fr 120px">
        <Field label="Latitud"><NumberInput value={block.lat} onChange={(v) => set("lat", v)} step={0.000001} /></Field>
        <Field label="Longitud"><NumberInput value={block.lng} onChange={(v) => set("lng", v)} step={0.000001} /></Field>
        <Field label="Zoom"><NumberInput value={block.zoom} onChange={(v) => set("zoom", v)} min={1} max={20} /></Field>
      </Row>
      <Field label="URL de Google Maps"><TextInput type="url" value={block.mapsUrl} onChange={(v) => set("mapsUrl", v)} placeholder="https://maps.google.com/…" /></Field>
    </>
  );
}
