-- 2026-05-03 · Add per-project editorial framing
--
-- Moves the kicker / intro / meta strings from the hardcoded dictionary
-- in web/src/pages/[slug].astro into the projects table so that any
-- admin-created project gets the same cinematic treatment as the
-- original three (olivea, fritanguita, maizal).

alter table public.projects
  add column if not exists framing jsonb;

-- Backfill the three originals so the public site keeps rendering
-- with the existing copy. Safe to re-run: only updates rows whose
-- framing is currently null.

update public.projects
set framing = jsonb_build_object(
  'kicker_es', 'Capítulo 01 · Lo lento',
  'kicker_en', 'Chapter 01 · The slow',
  'intro_es',  'Aquí cocino con lo que el huerto deja esa mañana. Valle de Guadalupe.',
  'intro_en',  'Here I cook with what the garden leaves that morning. Valle de Guadalupe.',
  'meta_es',   'Estrella Michelin · Estrella Verde Michelin',
  'meta_en',   'Michelin Star · Michelin Green Star'
)
where slug = 'olivea' and framing is null;

update public.projects
set framing = jsonb_build_object(
  'kicker_es', 'Capítulo 02 · Lo rápido',
  'kicker_en', 'Chapter 02 · The fast',
  'intro_es',  'Cuando bajo a la ciudad. Fritanga poblana en Roma Norte, con Santiago Muñoz.',
  'intro_en',  'When I come down to the city. Poblano fritanga in Roma Norte, with Santiago Muñoz.',
  'meta_es',   'Calle Puebla 236 · Roma Norte · CDMX',
  'meta_en',   'Calle Puebla 236 · Roma Norte · Mexico City'
)
where slug = 'fritanguita' and framing is null;

update public.projects
set framing = jsonb_build_object(
  'kicker_es', 'Capítulo 03 · El primer maestro',
  'kicker_en', 'Chapter 03 · The first teacher',
  'intro_es',  'Ocho años en La Casona de los Sapos. Lo que aprendí ahí todavía cocina lo que hago.',
  'intro_en',  'Eight years at La Casona de los Sapos. What I learned there still cooks what I do.',
  'meta_es',   'Puebla · 2017–2024 · Cerrado',
  'meta_en',   'Puebla · 2017–2024 · Closed'
)
where slug = 'maizal' and framing is null;
