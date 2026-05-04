-- ─────────────────────────────────────────────────────────────────────
-- danielnates.com — Supabase schema (custom admin replacement for Sanity)
-- Run via: Supabase Dashboard → SQL Editor → Paste → Run
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Helper: updated_at trigger ────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Helper: who is allowed in the admin? ─────────────────────────────
-- Add admin emails here. Anyone else who logs in is denied at API level.
create table if not exists public.admin_emails (
  email text primary key,
  scope text default 'all',                  -- 'all' = full admin; '<project-slug>' = scoped
  added_at timestamptz default now()
);

-- Seed: replace with your real emails
insert into public.admin_emails (email, scope) values
  ('rose@roseiies.com', 'all')
on conflict (email) do nothing;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.admin_emails
    where email = auth.jwt() ->> 'email'
      and scope = 'all'
  );
$$;

create or replace function can_edit_project(project_slug text)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.admin_emails
    where email = auth.jwt() ->> 'email'
      and (scope = 'all' or scope = project_slug)
  );
$$;

-- ─────────────────────────────────────────────────────────────────────
-- SINGLETONS
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.site_settings (
  id            text primary key default 'singleton',
  site_name     text,
  description_es text,
  description_en text,
  default_og_url text,
  navigation    jsonb,
  footer        jsonb,
  updated_at    timestamptz not null default now()
);
drop trigger if exists site_settings_set_updated on public.site_settings;
create trigger site_settings_set_updated before update on public.site_settings
  for each row execute procedure set_updated_at();

create table if not exists public.person (
  id            text primary key default 'daniel',
  name          text,
  tagline_es    text,
  tagline_en    text,
  subline_es    text,
  subline_en    text,
  portrait_url  text,
  bio_short_es  text,
  bio_short_en  text,
  bio_long_es   jsonb,                     -- portable-text-like: array of blocks
  bio_long_en   jsonb,
  pillars       jsonb,                     -- array of {label, copy_es, copy_en}
  voice         jsonb,                     -- {es_url, en_url, caption}
  social        jsonb,                     -- {olivea_instagram, fritanguita_instagram, email}
  updated_at    timestamptz not null default now()
);
drop trigger if exists person_set_updated on public.person;
create trigger person_set_updated before update on public.person
  for each row execute procedure set_updated_at();

create table if not exists public.press_kit (
  id              text primary key default 'singleton',
  bio_one_line_es text,
  bio_one_line_en text,
  bio_short_es    text,
  bio_short_en    text,
  bio_long_es     jsonb,
  bio_long_en     jsonb,
  photos          jsonb,                     -- array of {url, caption, credit}
  recognitions    jsonb,                     -- array of {year, label, org, url}
  mentions        jsonb,                     -- array of {outlet, title, url, date, language}
  press_pdf_url   text,
  press_email     text,
  updated_at      timestamptz not null default now()
);
drop trigger if exists press_kit_set_updated on public.press_kit;
create trigger press_kit_set_updated before update on public.press_kit
  for each row execute procedure set_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- MULTI-ROW CONTENT
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  status          text check (status in ('primary','secondary','past')) default 'secondary',
  summary_es      text,
  summary_en      text,
  hero_image_url  text,
  hero_video_url  text,
  body_es         jsonb,                     -- legacy portable-text body
  body_en         jsonb,
  blocks          jsonb,                     -- page-builder blocks array
  links           jsonb,                     -- array of {label, href}
  voice           jsonb,
  framing         jsonb,                     -- {kicker_es,kicker_en,intro_es,intro_en,meta_es,meta_en}
  published       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
drop trigger if exists projects_set_updated on public.projects;
create trigger projects_set_updated before update on public.projects
  for each row execute procedure set_updated_at();
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_published_idx on public.projects (published);

create table if not exists public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  date          date not null default current_date,
  excerpt_es    text,
  excerpt_en    text,
  cover_url     text,
  tags          text[],
  voice         jsonb,
  blocks        jsonb,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists articles_set_updated on public.articles;
create trigger articles_set_updated before update on public.articles
  for each row execute procedure set_updated_at();
create index if not exists articles_date_idx on public.articles (date desc);
create index if not exists articles_published_idx on public.articles (published);

create table if not exists public.art_pieces (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  cover_url     text,
  year          int,
  medium        text,
  dimensions    text,
  statement_es  text,
  statement_en  text,
  voice         jsonb,
  blocks        jsonb,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists art_pieces_set_updated on public.art_pieces;
create trigger art_pieces_set_updated before update on public.art_pieces
  for each row execute procedure set_updated_at();
create index if not exists art_pieces_year_idx on public.art_pieces (year desc);
create index if not exists art_pieces_published_idx on public.art_pieces (published);

create table if not exists public.daily_briefs (
  id            uuid primary key default gen_random_uuid(),
  date          date not null default current_date,
  image_url     text,
  line_es       text,
  line_en       text,
  place         text,
  voice         jsonb,
  published     boolean not null default true,    -- briefs default to published
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists daily_briefs_set_updated on public.daily_briefs;
create trigger daily_briefs_set_updated before update on public.daily_briefs
  for each row execute procedure set_updated_at();
create index if not exists daily_briefs_date_idx on public.daily_briefs (date desc);
create index if not exists daily_briefs_published_idx on public.daily_briefs (published);

create table if not exists public.field_notes (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  date          date not null default current_date,
  category      text check (category in ('ingredient','territory','technique','influence')),
  body_es       jsonb,
  body_en       jsonb,
  external_link text,
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
drop trigger if exists field_notes_set_updated on public.field_notes;
create trigger field_notes_set_updated before update on public.field_notes
  for each row execute procedure set_updated_at();
create index if not exists field_notes_date_idx on public.field_notes (date desc);

create table if not exists public.press_mentions (
  id          uuid primary key default gen_random_uuid(),
  outlet      text not null,
  title       text,
  url         text not null,
  date        date,
  language    text check (language in ('es','en')),
  created_at  timestamptz not null default now()
);
create index if not exists press_mentions_date_idx on public.press_mentions (date desc);

-- Existing contact_messages + newsletter_subscribers (keep)
create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  locale      text check (locale in ('es','en')),
  source      text
);

create table if not exists public.newsletter_subscribers (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  locale      text check (locale in ('es','en')),
  confirmed   boolean not null default false
);

-- ─────────────────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- Public reads ONLY published content.
-- Admin writes via authenticated session (checked by is_admin()).
-- ─────────────────────────────────────────────────────────────────────

-- helper: enable RLS + standard policies for content tables
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'site_settings','person','press_kit',
      'projects','articles','art_pieces','daily_briefs','field_notes','press_mentions'
    ])
  loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end$$;

-- Drop all existing policies on these tables (clean slate)
do $$
declare
  t text;
  p text;
begin
  for t in
    select unnest(array[
      'site_settings','person','press_kit',
      'projects','articles','art_pieces','daily_briefs','field_notes','press_mentions'
    ])
  loop
    for p in
      select policyname from pg_policies where schemaname = 'public' and tablename = t
    loop
      execute format('drop policy if exists %I on public.%I', p, t);
    end loop;
  end loop;
end$$;

-- Public SELECT (only published; singletons always readable)
create policy "anon read site_settings"  on public.site_settings  for select to anon, authenticated using (true);
create policy "anon read person"         on public.person         for select to anon, authenticated using (true);
create policy "anon read press_kit"      on public.press_kit      for select to anon, authenticated using (true);
create policy "anon read projects"       on public.projects       for select to anon, authenticated using (published = true);
create policy "anon read articles"       on public.articles       for select to anon, authenticated using (published = true);
create policy "anon read art_pieces"     on public.art_pieces     for select to anon, authenticated using (published = true);
create policy "anon read daily_briefs"   on public.daily_briefs   for select to anon, authenticated using (published = true);
create policy "anon read field_notes"    on public.field_notes    for select to anon, authenticated using (published = true);
create policy "anon read press_mentions" on public.press_mentions for select to anon, authenticated using (true);

-- Admin: full CRUD on everything
create policy "admin all site_settings"  on public.site_settings  for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all person"         on public.person         for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all press_kit"      on public.press_kit      for all to authenticated using (is_admin()) with check (is_admin());
create policy "scoped admin projects"    on public.projects       for all to authenticated using (can_edit_project(slug)) with check (can_edit_project(slug));
create policy "admin all articles"       on public.articles       for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all art_pieces"     on public.art_pieces     for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all daily_briefs"   on public.daily_briefs   for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all field_notes"    on public.field_notes    for all to authenticated using (is_admin()) with check (is_admin());
create policy "admin all press_mentions" on public.press_mentions for all to authenticated using (is_admin()) with check (is_admin());

-- contact_messages: anon may insert only
alter table public.contact_messages enable row level security;
drop policy if exists "anon insert contact_messages" on public.contact_messages;
create policy "anon insert contact_messages"
  on public.contact_messages for insert to anon
  with check (
    char_length(name) between 1 and 200
    and char_length(email) between 3 and 320
    and char_length(message) between 1 and 5000
  );
drop policy if exists "admin read contact_messages" on public.contact_messages;
create policy "admin read contact_messages"
  on public.contact_messages for select to authenticated using (is_admin());

-- newsletter_subscribers: anon may insert
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "anon insert newsletter" on public.newsletter_subscribers;
create policy "anon insert newsletter"
  on public.newsletter_subscribers for insert to anon
  with check (char_length(email) between 3 and 320);
drop policy if exists "admin read newsletter" on public.newsletter_subscribers;
create policy "admin read newsletter"
  on public.newsletter_subscribers for select to authenticated using (is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- STORAGE
-- Public-readable bucket for media (portraits, briefs, articles, art, projects).
-- Admin uploads via authenticated session.
-- ─────────────────────────────────────────────────────────────────────

insert into storage.buckets (id, name, public)
  values ('media', 'media', true)
  on conflict (id) do nothing;

drop policy if exists "anon read media" on storage.objects;
create policy "anon read media" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "admin write media" on storage.objects;
create policy "admin write media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and is_admin())
  with check (bucket_id = 'media' and is_admin());
