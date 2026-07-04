-- ============================================================
-- OpenSAM Migration 003 — Encrypt sensitive company identifiers
-- Run AFTER 002_multiuser_rls.sql.
--
-- Problem: company_profiles.ein and .uei are stored in plaintext.
--          EIN (Employer Identification Number) is a US tax identifier
--          that should never be stored in cleartext.
--
-- Solution: Use Supabase Vault (pgsodium) to encrypt at column level.
--   - A "key_id" is created once per project (stored in Vault).
--   - A new column ein_encrypted (bytea) holds the ciphertext.
--   - The old ein (text) column is dropped after a back-fill window.
--   - A view exposes plaintext only to service_role / owners.
--
-- Prerequisite: enable the Vault extension in Supabase Dashboard:
--   Database → Extensions → search "vault" → enable.
-- ============================================================

-- ── 1. Enable pgsodium + vault if not already enabled ──────────────────
create extension if not exists pgcrypto;
create extension if not exists pgsodium;
create extension if not exists vault with schema vault;

-- ── 2. Create a key for OpenSAM PII encryption (one-time) ──────────────
do $$
declare
  k uuid;
begin
  -- Check if the key already exists by name
  select id into k from vault.decrypted_secrets where name = 'opensam_pii_key' limit 1;
  if k is null then
    -- vault.create_key returns the key UUID; we then store it as a named secret
    perform vault.create_key();
    -- The latest-created key is what we reference; capture by name below.
    insert into vault.secrets (name, description, secret)
      values ('opensam_pii_key', 'Column-encryption key for OpenSAM PII (EIN, UEI)', '')
      on conflict (name) do nothing;
  end if;
end $$;

-- ── 3. Add encrypted columns ───────────────────────────────────────────
alter table company_profiles
  add column if not exists ein_encrypted bytea,
  add column if not exists uei_encrypted bytea;

-- ── 4. Helper functions: encrypt / decrypt ─────────────────────────────
-- Use pgsodium.crypto_aead_xchacha20poly1305_ietf_encrypt (libsodium default AEAD).

create or replace function opensam_encrypt(plaintext text)
returns bytea
language sql
stable
as $$
  select pgsodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    convert_to(coalesce(plaintext, ''), 'utf8'),
    '',                                       -- additional data
    (select key_id from vault.decrypted_secrets where name = 'opensam_pii_key' limit 1),
    ''
  );
$$;

create or replace function opensam_decrypt(ciphertext bytea)
returns text
language sql
stable
as $$
  select convert_from(
    pgsodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      ciphertext,
      '',
      (select key_id from vault.decrypted_secrets where name = 'opensam_pii_key' limit 1),
      ''
    ),
    'utf8'
  );
$$;

-- ── 5. Back-fill encrypted columns from existing plaintext ─────────────
update company_profiles
  set ein_encrypted = opensam_encrypt(ein)
  where ein is not null and ein_encrypted is null;

update company_profiles
  set uei_encrypted = opensam_encrypt(uei)
  where uei is not null and uei_encrypted is null;

-- ── 6. Drop plaintext columns ──────────────────────────────────────────
alter table company_profiles
  drop column if exists ein,
  drop column if exists uei;

-- ── 7. Trigger to keep encrypted columns in sync ───────────────────────
-- Frontend sends ein/uei as plaintext via a SECURITY DEFINER function (below).
-- This trigger intercepts those columns (added back as "staging") and encrypts them.

-- Add back temporary plaintext columns used by the API surface
alter table company_profiles
  add column if not exists ein text,
  add column if not exists uei text;

create or replace function trg_encrypt_pii()
returns trigger
language plpgsql
security definer
set search_path = public, vault, pgsodium
as $$
begin
  if new.ein is distinct from old.ein or (tg_op = 'INSERT' and new.ein is not null) then
    new.ein_encrypted := opensam_encrypt(new.ein);
    new.ein := null;  -- wipe staging column immediately
  end if;
  if new.uei is distinct from old.uei or (tg_op = 'INSERT' and new.uei is not null) then
    new.uei_encrypted := opensam_encrypt(new.uei);
    new.uei := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_encrypt_pii on company_profiles;
create trigger trg_encrypt_pii
  before insert or update on company_profiles
  for each row execute function trg_encrypt_pii();

-- ── 8. SECURITY DEFINER function to read decrypted profile ─────────────
-- Only the service_role (Edge Functions) can call this — it bypasses RLS.
-- Frontend clients must NOT call this; they go through the Edge Function.

create or replace function get_company_profile_decrypted(p_user_id uuid)
returns table (
  id uuid,
  name text,
  ein text,
  uei text,
  naics_codes text[],
  capabilities text[],
  certifications text[],
  past_performance text[],
  state text,
  updated_at timestamptz
)
language sql
security definer
set search_path = public, vault, pgsodium
as $$
  select
    id,
    name,
    case when ein_encrypted is null then null else opensam_decrypt(ein_encrypted) end,
    case when uei_encrypted is null then null else opensam_decrypt(uei_encrypted) end,
    naics_codes,
    capabilities,
    certifications,
    past_performance,
    state,
    updated_at
  from company_profiles
  where user_id = p_user_id
  limit 1;
$$;

revoke execute on function get_company_profile_decrypted(uuid) from anon, authenticated;
grant execute on function get_company_profile_decrypted(uuid) to service_role;
