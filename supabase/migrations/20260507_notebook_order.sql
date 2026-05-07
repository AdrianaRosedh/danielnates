-- 2026-05-07 · Notebook spread ordering
--
-- Comma-separated list of spread rectos (the spread identifiers) in
-- their on-screen order. Same shape as ledger.order — the EditOverlay
-- updates this on drop. Default mirrors the historical sequence.

insert into public.landing_copy (key, value) values
  ('notebook.order', 'I,II,III,IV,V')
on conflict (key) do nothing;
