-- The whole codebase (queries.ts ARTICLE_COLS, the inline-edit
-- registry, diario/[slug]) reads and writes articles.body_es/body_en,
-- but the columns were never created — every articles SELECT failed
-- silently and inline body edits would have errored.
-- Applied to the remote project on 2026-06-09 via MCP.
alter table public.articles
  add column if not exists body_es jsonb,
  add column if not exists body_en jsonb;
