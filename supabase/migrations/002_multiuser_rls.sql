-- ============================================================
-- OpenSAM Migration 002 — Multi-user + RLS hardening
-- Run AFTER 001_schema.sql in Supabase SQL Editor.
--
-- This migration:
--   1. Adds user_id to every row-based table.
--   2. Drops the dangerously permissive `using (true) with check (true)` policies.
--   3. Re-creates policies scoped to auth.uid().
--   4. Adds indexes that improve dashboard query performance.
--   5. Adds updated_at triggers.
--
-- Backward-compat: existing rows get user_id = NULL. They are still
-- visible only to a server-side service role (RLS bypass).
-- You can manually assign them via:
--   update saved_opportunities set user_id = '<uuid>' where user_id is null;
-- ============================================================

-- ── 0. Enum types (was text before — keep loose until 003 tightens it) ──
do $$ begin
  create type opportunity_status as enum ('active','closed','awarded','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notice_kind as enum ('Solicitation','Award','Presolicitation','Sources Sought','Other');
exception when duplicate_object then null; end $$;

-- ── 1. saved_opportunities ─────────────────────────────────────────────
alter table saved_opportunities
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_at timestamptz default now();

-- Index for "my saved opportunities" dashboard query
create index if not exists idx_saved_user_created
  on saved_opportunities (user_id, saved_at desc);

create index if not exists idx_saved_status
  on saved_opportunities (status);

create index if not exists idx_saved_deadline
  on saved_opportunities (response_deadline);

-- ── 2. bid_analyses ────────────────────────────────────────────────────
alter table bid_analyses
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists idx_analyses_user
  on bid_analyses (user_id);

-- ── 3. company_profiles ────────────────────────────────────────────────
alter table company_profiles
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists created_at timestamptz default now();

-- One profile per user
create unique index if not exists uniq_profile_per_user
  on company_profiles (user_id)
  where user_id is not null;

-- ── 4. Drop the dangerous `using (true)` policies ──────────────────────
drop policy if exists "allow_all_saved"    on saved_opportunities;
drop policy if exists "allow_all_analyses" on bid_analyses;
drop policy if exists "allow_all_profiles" on company_profiles;

-- ── 5. Re-create policies scoped to auth.uid() ─────────────────────────

-- saved_opportunities: users see only their own rows
create policy "saved_select_own"
  on saved_opportunities for select
  to authenticated
  using (user_id = auth.uid());

create policy "saved_insert_own"
  on saved_opportunities for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "saved_update_own"
  on saved_opportunities for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saved_delete_own"
  on saved_opportunities for delete
  to authenticated
  using (user_id = auth.uid());

-- bid_analyses: same model
create policy "analyses_select_own"
  on bid_analyses for select
  to authenticated
  using (user_id = auth.uid());

create policy "analyses_insert_own"
  on bid_analyses for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "analyses_update_own"
  on bid_analyses for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "analyses_delete_own"
  on bid_analyses for delete
  to authenticated
  using (user_id = auth.uid());

-- company_profiles: same model
create policy "profiles_select_own"
  on company_profiles for select
  to authenticated
  using (user_id = auth.uid());

create policy "profiles_insert_own"
  on company_profiles for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "profiles_update_own"
  on company_profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "profiles_delete_own"
  on company_profiles for delete
  to authenticated
  using (user_id = auth.uid());

-- ── 6. updated_at trigger for company_profiles ─────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_company_profiles_updated on company_profiles;
create trigger trg_company_profiles_updated
  before update on company_profiles
  for each row execute function set_updated_at();

-- ── 7. Helper: auto-assign user_id on insert if missing ────────────────
-- Lets the frontend `insert` without manually setting user_id every time.
create or replace function auto_user_id()
returns trigger
language plpgsql
as $$
begin
  if new.user_id is null and auth.uid() is not null then
    new.user_id := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_saved_user_id on saved_opportunities;
create trigger trg_saved_user_id
  before insert on saved_opportunities
  for each row execute function auto_user_id();

drop trigger if exists trg_analyses_user_id on bid_analyses;
create trigger trg_analyses_user_id
  before insert on bid_analyses
  for each row execute function auto_user_id();

drop trigger if exists trg_profiles_user_id on company_profiles;
create trigger trg_profiles_user_id
  before insert on company_profiles
  for each row execute function auto_user_id();

-- ── 8. Migrate status/notice_type to enums (NULLs allowed for back-compat)
alter table saved_opportunities
  alter column status type opportunity_status
  using (status::opportunity_status);

alter table saved_opportunities
  alter column status set default 'active';

alter table saved_opportunities
  alter column notice_type type notice_kind
  using (nullif(notice_type, '')::notice_kind);

-- ── 9. Remove the seed row from 001 (it had no user_id, would be invisible)
delete from company_profiles where user_id is null;
