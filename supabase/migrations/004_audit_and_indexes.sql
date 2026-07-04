-- ============================================================
-- OpenSAM Migration 004 — Audit log + additional indexes
-- Run AFTER 002_multiuser_rls.sql and 003_pii_encryption.sql.
-- ============================================================

-- ── 1. audit_log table ─────────────────────────────────────────────────
-- Tracks who did what to which opportunity — useful for compliance reviews.
create table if not exists audit_log (
  id              bigint primary key generated always as identity,
  user_id         uuid references auth.users(id) on delete set null,
  action          text not null check (action in (
                    'save_opportunity','unsave_opportunity',
                    'analyze_opportunity','view_opportunity',
                    'update_profile','export_data'
                  )),
  entity_type     text not null,
  entity_id       text,
  metadata        jsonb default '{}'::jsonb,
  ip_address      inet,
  user_agent      text,
  created_at      timestamptz not null default now()
);

alter table audit_log enable row level security;

-- Users can read their own audit entries; service_role can read all.
create policy "audit_select_own"
  on audit_log for select
  to authenticated
  using (user_id = auth.uid());

-- Only service_role can insert audit_log entries (Edge Functions).
revoke insert, update, delete on audit_log from anon, authenticated;

-- Indexes
create index if not exists idx_audit_user_time on audit_log (user_id, created_at desc);
create index if not exists idx_audit_entity     on audit_log (entity_type, entity_id);

-- ── 2. Additional indexes for saved_opportunities dashboard ────────────
create index if not exists idx_saved_naics   on saved_opportunities (naics_code);
create index if not exists idx_saved_agency  on saved_opportunities (agency);
create index if not exists idx_saved_user_status on saved_opportunities (user_id, status);

-- ── 3. Bid analyses: composite index for cache lookups ─────────────────
create index if not exists idx_analyses_user_opp
  on bid_analyses (user_id, opportunity_id);

-- ── 4. Notice-type enum already exists from 002. Add a check on set_aside.
alter table saved_opportunities
  add constraint chk_set_aside_length check (char_length(coalesce(set_aside, '')) <= 100);

-- ── 5. Soft-delete column for saved_opportunities (so analyses stay) ────
alter table saved_opportunities
  add column if not exists deleted_at timestamptz;

-- View that hides soft-deleted rows from typical dashboard queries
create or replace view active_saved_opportunities as
  select * from saved_opportunities where deleted_at is null;

-- ── 6. Auto-log trigger for bid_analyses (records every analysis run) ───
create or replace function log_analysis_run()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into audit_log (user_id, action, entity_type, entity_id, metadata)
  values (
    new.user_id,
    'analyze_opportunity',
    'bid_analysis',
    new.opportunity_id,
    jsonb_build_object('viability_score', new.viability_score, 'analyzed_at', new.analyzed_at)
  );
  return new;
end;
$$;

drop trigger if exists trg_log_analysis on bid_analyses;
create trigger trg_log_analysis
  after insert on bid_analyses
  for each row execute function log_analysis_run();
