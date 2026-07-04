-- ============================================================
-- OpenSAM Migration 003 — Encrypt sensitive company identifiers
-- (pgcrypto version — does NOT require Supabase Vault / pgsodium)
-- ============================================================

create extension if not exists pgcrypto;

create schema if not exists secrets;

create table if not exists secrets.encryption_keys (
  id         text primary key,
  key        text not null,
  created_at timestamptz not null default now()
);

do $$ declare
  k text;
begin
  select encode(gen_random_bytes(32), 'hex') into k;
  insert into secrets.encryption_keys (id, key)
  values ('opensam_pii_key', k)
  on conflict (id) do nothing;
end $$;

revoke all on schema secrets from anon, authenticated, public;
revoke all on secrets.encryption_keys from anon, authenticated, public;
grant usage on schema secrets to service_role;
grant select on secrets.encryption_keys to service_role;

alter table company_profiles
  add column if not exists ein_encrypted bytea,
  add column if not exists uei_encrypted bytea;

create or replace function opensam_encrypt(plaintext text)
returns bytea
language sql
security definer
set search_path = public, secrets
as $$   select pgp_sym_encrypt(
    coalesce(plaintext, ''),
    (select key from secrets.encryption_keys where id = 'opensam_pii_key')
  );
 $$;

create or replace function opensam_decrypt(ciphertext bytea)
returns text
language sql
security definer
set search_path = public, secrets
as $$   select pgp_sym_decrypt(
    ciphertext,
    (select key from secrets.encryption_keys where id = 'opensam_pii_key')
  );
 $$;

revoke execute on function opensam_encrypt(text)  from anon, public;
revoke execute on function opensam_decrypt(bytea) from anon, public;
grant  execute on function opensam_encrypt(text)  to authenticated;
grant  execute on function opensam_decrypt(bytea) to authenticated;

update company_profiles
  set ein_encrypted = opensam_encrypt(ein)
  where ein is not null and ein_encrypted is null;

update company_profiles
  set uei_encrypted = opensam_encrypt(uei)
  where uei is not null and uei_encrypted is null;

alter table company_profiles
  drop column if exists ein,
  drop column if exists uei;

alter table company_profiles
  add column if not exists ein text,
  add column if not exists uei text;

create or replace function trg_encrypt_pii()
returns trigger
language plpgsql
security definer
set search_path = public, secrets
as $$ begin
  if new.ein is distinct from old.ein or (tg_op = 'INSERT' and new.ein is not null) then
    new.ein_encrypted := opensam_encrypt(new.ein);
    new.ein := null;
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

create or replace function get_company_profile_decrypted(p_user_id uuid)
returns table (
  id               uuid,
  name             text,
  ein              text,
  uei              text,
  naics_codes      text[],
  capabilities     text[],
  certifications   text[],
  past_performance text[],
  state            text,
  updated_at       timestamptz
)
language sql
security definer
set search_path = public, secrets
as $$   select
    cp.id,
    cp.name,
    case when cp.ein_encrypted is null then null else opensam_decrypt(cp.ein_encrypted) end,
    case when cp.uei_encrypted is null then null else opensam_decrypt(cp.uei_encrypted) end,
    cp.naics_codes,
    cp.capabilities,
    cp.certifications,
    cp.past_performance,
    cp.state,
    cp.updated_at
  from company_profiles cp
  where cp.user_id = p_user_id
  limit 1;
 $$;

revoke execute on function get_company_profile_decrypted(uuid) from anon, authenticated;
grant  execute on function get_company_profile_decrypted(uuid) to service_role;
