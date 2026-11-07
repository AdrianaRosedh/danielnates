-- ─────────────────────────────────────────────────────────────────────
-- Security + performance hardening (2026-11-07)
--
-- Addresses Supabase advisor findings and a white-box review:
--   1. SECURITY DEFINER helpers pinned to an empty search_path (0011),
--      email match made case-insensitive, and not executable by anon (0028).
--   2. Client roles stripped of TRUNCATE / TRIGGER / REFERENCES — RLS does
--      not govern those privileges.
--   3. Exactly one permissive policy per role + action (0006); is_admin()
--      wrapped in a scalar subquery so it is evaluated once per statement.
--   4. Contact form writes go through a validated, rate-limited RPC; the
--      direct anon INSERT path (which bypassed the site's honeypot) is closed.
--   5. Unused newsletter anon-insert path closed.
--   6. Media bucket: size cap + MIME allowlist (no SVG/HTML → no stored XSS
--      on the storage origin).
--
-- Idempotent: safe to re-run.
-- ─────────────────────────────────────────────────────────────────────

-- 1 ── Helper functions ────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and scope = 'all'
  );
$$;

create or replace function public.can_edit_project(project_slug text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and (scope = 'all' or scope = project_slug)
  );
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.can_edit_project(text) from public, anon;
grant  execute on function public.is_admin() to authenticated, service_role;
grant  execute on function public.can_edit_project(text) to authenticated, service_role;

alter function public.set_updated_at() set search_path = '';
alter function public.tg_landing_copy_touch() set search_path = '';

-- 2 ── Privileges RLS does not cover ───────────────────────────────────
revoke truncate, trigger, references on all tables in schema public from anon, authenticated;
alter default privileges in schema public
  revoke truncate, trigger, references on tables from anon, authenticated;

-- Allow-lists / secrets are server-only (RLS already denies; belt + braces).
revoke all on table public.admin_emails from anon, authenticated;
revoke all on table public.fritanguita_secrets from anon, authenticated;

-- 3 ── One permissive policy per role + action ─────────────────────────
-- Published-content tables: anon sees published rows; signed-in users see
-- published rows, admins everything; only admins write.
do $$
declare t text;
begin
  -- (field_notes is dropped by 20260609_drop_field_notes.sql, applied 2026-11-07.)
  foreach t in array array['articles', 'art_pieces', 'daily_briefs'] loop
    execute format('drop policy if exists %I on public.%I', 'admin all ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'anon read ' || t, t);
    execute format('drop policy if exists %I on public.%I', t || ' public read', t);
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin insert', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin update', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin delete', t);

    execute format('create policy %I on public.%I for select to anon using (published)', t || ' public read', t);
    execute format('create policy %I on public.%I for select to authenticated using (published or (select public.is_admin()))', t || ' read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))', t || ' admin insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t || ' admin update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || ' admin delete', t);
  end loop;
end $$;

-- Always-public tables: one read policy for everyone; admin-only writes.
do $$
declare t text;
begin
  foreach t in array array['site_settings', 'person', 'press_kit', 'press_mentions'] loop
    execute format('drop policy if exists %I on public.%I', 'admin all ' || t, t);
    execute format('drop policy if exists %I on public.%I', 'anon read ' || t, t);
    execute format('drop policy if exists %I on public.%I', t || ' public read', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin insert', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin update', t);
    execute format('drop policy if exists %I on public.%I', t || ' admin delete', t);

    execute format('create policy %I on public.%I for select to anon, authenticated using (true)', t || ' public read', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))', t || ' admin insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t || ' admin update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || ' admin delete', t);
  end loop;
end $$;

-- landing_copy keeps its public read policy; the ALL write policy is split.
drop policy if exists "landing_copy admin write"  on public.landing_copy;
drop policy if exists "landing_copy admin insert" on public.landing_copy;
drop policy if exists "landing_copy admin update" on public.landing_copy;
drop policy if exists "landing_copy admin delete" on public.landing_copy;
create policy "landing_copy admin insert" on public.landing_copy for insert to authenticated with check ((select public.is_admin()));
create policy "landing_copy admin update" on public.landing_copy for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "landing_copy admin delete" on public.landing_copy for delete to authenticated using ((select public.is_admin()));

-- projects: per-project editors (admin_emails.scope = slug) or full admins.
drop policy if exists "anon read projects"      on public.projects;
drop policy if exists "scoped admin projects"   on public.projects;
drop policy if exists "admin all projects"      on public.projects;
drop policy if exists "projects public read"    on public.projects;
drop policy if exists "projects read"           on public.projects;
drop policy if exists "projects editor insert"  on public.projects;
drop policy if exists "projects editor update"  on public.projects;
drop policy if exists "projects editor delete"  on public.projects;
create policy "projects public read"   on public.projects for select to anon using (published);
create policy "projects read"          on public.projects for select to authenticated using (published or public.can_edit_project(slug));
create policy "projects editor insert" on public.projects for insert to authenticated with check (public.can_edit_project(slug));
create policy "projects editor update" on public.projects for update to authenticated using (public.can_edit_project(slug)) with check (public.can_edit_project(slug));
create policy "projects editor delete" on public.projects for delete to authenticated using (public.can_edit_project(slug));

-- 4 ── Contact: validated + rate-limited RPC, no direct inserts ─────────
drop policy if exists "anon insert contact_messages" on public.contact_messages;
revoke insert, update, delete, select on public.contact_messages from anon;
revoke insert, update, delete on public.contact_messages from authenticated;

create index if not exists contact_messages_source_created_idx
  on public.contact_messages (source, created_at desc);

create or replace function public.submit_contact(
  p_name text,
  p_email text,
  p_message text,
  p_locale text default null,
  p_source text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  recent int;
begin
  if char_length(coalesce(p_name, '')) not between 1 and 200
     or char_length(coalesce(p_email, '')) not between 3 and 320
     or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
     or char_length(coalesce(p_message, '')) not between 1 and 5000 then
    raise exception 'invalid_input' using errcode = '22023';
  end if;

  -- Per-source burst limit (source = salted hash of the client IP, set by
  -- the site's API). Direct RPC callers can vary it, hence the global cap.
  if p_source is not null then
    select count(*) into recent
      from public.contact_messages
     where source = left(p_source, 128)
       and created_at > now() - interval '10 minutes';
    if recent >= 3 then
      raise exception 'rate_limited' using errcode = 'P0001';
    end if;
  end if;

  select count(*) into recent
    from public.contact_messages
   where created_at > now() - interval '1 hour';
  if recent >= 120 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;

  insert into public.contact_messages (name, email, message, locale, source)
  values (
    p_name,
    lower(p_email),
    p_message,
    case when p_locale in ('es', 'en') then p_locale else null end,
    left(p_source, 128)
  );
end;
$$;

revoke all on function public.submit_contact(text, text, text, text, text) from public;
grant execute on function public.submit_contact(text, text, text, text, text) to anon, authenticated, service_role;

-- 5 ── Newsletter: no UI posts to it — close the anon path ─────────────
drop policy if exists "anon insert newsletter" on public.newsletter_subscribers;
revoke insert, update, delete, select on public.newsletter_subscribers from anon;

-- 6 ── Media bucket guard rails ────────────────────────────────────────
update storage.buckets
   set file_size_limit = 52428800,  -- 50 MB
       allowed_mime_types = array[
         'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
         'video/mp4', 'video/webm', 'application/pdf'
       ]
 where id = 'media';

drop policy if exists "admin write media" on storage.objects;
create policy "admin write media" on storage.objects
  for all to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
