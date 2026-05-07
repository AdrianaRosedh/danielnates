-- 2026-05-07 · Landing-page editorial copy
--
-- Moves the hardcoded captions, places, mark words, ledger entries
-- and the closing line out of the component files into a flat
-- key/value table so an admin can edit them inline on the live site
-- via the EditOverlay. The components keep their existing fallbacks,
-- so this table is purely additive — empty rows = use the fallback.
--
-- Key namespace convention:
--   frame.<scene>.<field>_<locale>
--   notebook.<recto>.<field>_<locale>      (markWord, caption, place)
--   ledger.<brand>.<field>_<locale>        (project, state, cta)
--   closing.line_<locale>
--
-- Examples:
--   frame.huerto.caption_es
--   notebook.I.markWord
--   ledger.olivea.cta_es

create table if not exists public.landing_copy (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.landing_copy enable row level security;

-- Public read — the live site reads these on every render.
drop policy if exists "landing_copy public read" on public.landing_copy;
create policy "landing_copy public read"
  on public.landing_copy for select
  to anon, authenticated
  using (true);

-- Admin write — gated by is_admin() (full admin only).
drop policy if exists "landing_copy admin write" on public.landing_copy;
create policy "landing_copy admin write"
  on public.landing_copy for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Auto-bump updated_at on row updates.
create or replace function public.tg_landing_copy_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists landing_copy_touch on public.landing_copy;
create trigger landing_copy_touch
  before update on public.landing_copy
  for each row execute function public.tg_landing_copy_touch();

-- Seed values mirror the current hardcoded fallbacks. Safe to re-run:
-- the on conflict do nothing clause means we never overwrite an
-- admin's edits with the seed.
insert into public.landing_copy (key, value) values
  -- Frame scene II — El Huerto (moss tone) on the landing page
  ('frame.huerto.index',         'II'),
  ('frame.huerto.caption_es',    'Cuando la cocina escucha al campo primero.'),
  ('frame.huerto.caption_en',    'When the kitchen listens to the field first.'),
  ('frame.huerto.place_es',      'Olivea · Valle de Guadalupe · MMXXVI'),
  ('frame.huerto.place_en',      'Olivea · Valle de Guadalupe · MMXXVI'),

  -- Notebook spread I — Olivea / Huerto
  ('notebook.I.markWord',        'Huerto'),
  ('notebook.I.caption_es',      'El huerto manda. La carta cambia con la mañana.'),
  ('notebook.I.caption_en',      'The garden leads. The menu changes with the morning.'),
  ('notebook.I.place_es',        'Olivea · Valle de Guadalupe'),
  ('notebook.I.place_en',        'Olivea · Valle de Guadalupe'),

  -- Notebook spread II — Fritanguita / Cazo
  ('notebook.II.markWord',       'Cazo'),
  ('notebook.II.caption_es',     'Fritanga poblana, en su forma más contemporánea.'),
  ('notebook.II.caption_en',     'Poblano fritanga in its most contemporary form.'),
  ('notebook.II.place_es',       'Fritanguita · Roma Norte · CDMX'),
  ('notebook.II.place_en',       'Fritanguita · Roma Norte · CDMX'),

  -- Notebook spread III — Maizal / Maíz
  ('notebook.III.markWord',      'Maíz'),
  ('notebook.III.caption_es',    'El primer maestro. Lo que aprendí ahí, todavía cocina lo que hago.'),
  ('notebook.III.caption_en',    'The first teacher. What I learned there still cooks what I do.'),
  ('notebook.III.place_es',      'Maizal · Puebla · 2017–2024'),
  ('notebook.III.place_en',      'Maizal · Puebla · 2017–2024'),

  -- Notebook spread IV — Atelier / Mano
  ('notebook.IV.markWord',       'Mano'),
  ('notebook.IV.caption_es',     'La mano dibuja antes de cocinar. Composición, contraste, intención.'),
  ('notebook.IV.caption_en',     'The hand draws before it cooks. Composition, contrast, intent.'),
  ('notebook.IV.place_es',       'Atelier · MMXXVI'),
  ('notebook.IV.place_en',       'Studio · MMXXVI'),

  -- Notebook spread V — Closing / Mesa
  ('notebook.V.markWord',        'Mesa'),
  ('notebook.V.caption_es',      'La mesa es el último cuadro.'),
  ('notebook.V.caption_en',      'The table is the last painting.'),
  ('notebook.V.place_es',        'Daniel Nates · MMXXVI'),
  ('notebook.V.place_en',        'Daniel Nates · MMXXVI'),

  -- Ledger brief — three rows on the landing
  ('ledger.olivea.project',      'Olivea'),
  ('ledger.olivea.state_es',     'Carta del huerto · Valle de Guadalupe'),
  ('ledger.olivea.state_en',     'Garden menu · Valle de Guadalupe'),
  ('ledger.olivea.cta_es',       'Capítulo Olivea'),
  ('ledger.olivea.cta_en',       'Chapter Olivea'),

  ('ledger.fritanguita.project', 'Fritanguita'),
  ('ledger.fritanguita.state_es','Roma Norte · CDMX · con Santiago Muñoz'),
  ('ledger.fritanguita.state_en','Roma Norte · CDMX · with Santiago Muñoz'),
  ('ledger.fritanguita.cta_es',  'Capítulo Fritanguita'),
  ('ledger.fritanguita.cta_en',  'Chapter Fritanguita'),

  ('ledger.maizal.project',      'Maizal'),
  ('ledger.maizal.state_es',     'Puebla · 2017–2024 · archivo'),
  ('ledger.maizal.state_en',     'Puebla · 2017–2024 · archive'),
  ('ledger.maizal.cta_es',       'Capítulo Maizal'),
  ('ledger.maizal.cta_en',       'Chapter Maizal'),

  -- Closing — the last line of the film
  ('closing.line_es',            'La mesa es el último cuadro.'),
  ('closing.line_en',            'The table is the last painting.')
on conflict (key) do nothing;
