-- field_notes was removed from the public site (commit aa30665) and
-- has no remaining code paths. This migration deletes the table AND
-- ITS DATA permanently.
--
-- ⚠️  DESTRUCTIVE — apply manually only after confirming nothing in
-- the table is worth exporting:
--   select count(*) from public.field_notes;

-- Applied to production 2026-11-07 after verifying 0 rows, no inbound
-- foreign keys and no dependent views.

drop table if exists public.field_notes;
