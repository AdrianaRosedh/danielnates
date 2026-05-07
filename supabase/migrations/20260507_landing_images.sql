-- 2026-05-07 · Landing-page hero images as inline-editable URLs
--
-- Adds three more rows to landing_copy holding the URLs of the photos
-- on the landing page. Once seeded the FrameScene and ColdOpen will
-- look up these keys (with the existing /media/hero/... values as
-- fallbacks) so an admin can swap the photographs inline via the
-- EditOverlay's image-pick affordance.

insert into public.landing_copy (key, value) values
  -- Cold Open hero poster (the garden photograph at full presence)
  ('cold.poster.image_url',  '/media/hero/daniel-garden.jpg'),
  -- Frame scene II — El Huerto, the moss-tinted rest moment
  ('frame.huerto.image_url', '/media/hero/daniel-garden.jpg')
on conflict (key) do nothing;
