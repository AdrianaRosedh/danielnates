-- danielnates.com — Supabase schema
-- Apply by: copy/paste into Supabase Dashboard → SQL Editor → Run.
--
-- Tables:
--   contact_messages      — submissions from /contacto and /en/contact
--   newsletter_subscribers — email signups
--
-- Both rely on Row-Level Security: anon may INSERT only, never SELECT.
-- The site uses the service_role key from API routes for any reads.

-- ── Extensions ────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── contact_messages ──────────────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  locale      text check (locale in ('es', 'en')),
  source      text
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

alter table public.contact_messages enable row level security;

drop policy if exists "anon insert contact_messages" on public.contact_messages;
create policy "anon insert contact_messages"
  on public.contact_messages
  for insert
  to anon
  with check (
    char_length(name) between 1 and 200
    and char_length(email) between 3 and 320
    and char_length(message) between 1 and 5000
  );

-- ── newsletter_subscribers ────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id          uuid primary key default uuid_generate_v4(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  locale      text check (locale in ('es', 'en')),
  confirmed   boolean not null default false
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists "anon insert newsletter" on public.newsletter_subscribers;
create policy "anon insert newsletter"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (char_length(email) between 3 and 320);
