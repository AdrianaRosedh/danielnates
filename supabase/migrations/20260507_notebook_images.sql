-- 2026-05-07 · Notebook spread photos as inline-editable URLs
--
-- One image_url key per spread. Spread I keeps the existing garden
-- photograph; spreads II–V are seeded empty so the recto-plate
-- glyph keeps showing until Daniel uploads a photo for that spread
-- via the EditOverlay's "Cambiar foto" affordance.

insert into public.landing_copy (key, value) values
  ('notebook.I.image_url',   '/media/hero/daniel-garden.jpg'),
  ('notebook.II.image_url',  ''),
  ('notebook.III.image_url', ''),
  ('notebook.IV.image_url',  ''),
  ('notebook.V.image_url',   '')
on conflict (key) do nothing;
