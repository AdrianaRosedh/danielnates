-- 2026-05-04 · Per-tenant admin scoping
--
-- Lets us bring the Fritanguita team (or any future co-owner) into the
-- admin without giving them write access to Daniel's other content.
--
-- Model:
--   admin_emails.scope IN ('all', '<project-slug>')
--   - 'all'              → full admin (current behavior, what Adriana has)
--   - '<project-slug>'   → can read + write ONLY that project row + nothing else
--
-- The is_admin() function now requires scope='all', so the existing
-- admin policies on Daniel-only tables (articles, art_pieces, daily_briefs,
-- field_notes, press_kit, person, site_settings, press_mentions) silently
-- become full-admin-only — Fritanguita-scoped users can't touch them.
--
-- The projects table gets a new scoped policy (can_edit_project) that
-- returns true if the user is full-admin OR if their scope matches the
-- row's slug. Same function used both for write and to filter SELECTs
-- in the admin list (the public anon-read policy is unchanged).

alter table public.admin_emails
  add column if not exists scope text default 'all';

-- Default existing whitelist entries to 'all' so nothing changes for them.
update public.admin_emails set scope = 'all' where scope is null;

-- Tighten is_admin: full admin only.
create or replace function public.is_admin()
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

-- New helper: scope-aware project access.
create or replace function public.can_edit_project(project_slug text)
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

-- Replace the blanket projects admin policy with the scoped one.
drop policy if exists "admin all projects" on public.projects;
create policy "scoped admin projects"
  on public.projects
  for all
  to authenticated
  using (can_edit_project(slug))
  with check (can_edit_project(slug));
