-- ============================================================
-- Alice SAM Agent — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Saved Opportunities ──────────────────────────────────────
create table if not exists saved_opportunities (
  id                   text primary key,
  title                text not null,
  agency               text,
  solicitation_number  text,
  notice_type          text,
  naics_code           text,
  posted_date          text,
  response_deadline    text,
  place_of_performance text,
  set_aside            text,
  status               text default 'active',
  description          text,
  pdf_url              text,
  match_score          integer,
  saved_at             timestamptz default now()
);

-- ── Bid Analyses Cache ────────────────────────────────────────
create table if not exists bid_analyses (
  opportunity_id          text primary key references saved_opportunities(id) on delete cascade,
  summary                 text,
  viability_score         integer,
  requirements            text[],
  risks                   text[],
  missing_certifications  text[],
  estimated_contract_value text,
  draft_proposal          text,
  analyzed_at             timestamptz default now()
);

-- ── Company Profiles ──────────────────────────────────────────
create table if not exists company_profiles (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null default 'AliceLabs LLC',
  ein              text,
  uei              text,
  naics_codes      text[] default array['541511','541512','541519','518210'],
  capabilities     text[] default array['artificial intelligence','machine learning','cloud infrastructure','software development'],
  certifications   text[] default array['Small Business'],
  past_performance text[],
  state            text default 'WY',
  updated_at       timestamptz default now()
);

-- ── RLS Policies (Public / single-tenant for now) ─────────────
alter table saved_opportunities enable row level security;
alter table bid_analyses enable row level security;
alter table company_profiles enable row level security;

-- Allow all authenticated and anonymous access (single-user app)
-- Tighten these policies when you add Supabase Auth login
create policy "allow_all_saved" on saved_opportunities for all using (true) with check (true);
create policy "allow_all_analyses" on bid_analyses for all using (true) with check (true);
create policy "allow_all_profiles" on company_profiles for all using (true) with check (true);

-- ── Seed default company profile ──────────────────────────────
insert into company_profiles (name, state)
values ('AliceLabs LLC', 'WY')
on conflict do nothing;
