-- 2026-05-07 · Ledger row ordering
--
-- A single comma-separated value holding the order in which the
-- ledger rows render on the landing page. The EditOverlay's drag
-- handles update this key on drop. New brands automatically get
-- appended; missing brands automatically drop out.

insert into public.landing_copy (key, value) values
  ('ledger.order', 'olivea,fritanguita,maizal')
on conflict (key) do nothing;
