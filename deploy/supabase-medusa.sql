-- Run once in the Supabase SQL editor as postgres, before Medusa migrations.
-- This does not change the existing public commission quota RPC.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'baetee_medusa') then
    create role baetee_medusa login nosuperuser nocreatedb nocreaterole noreplication;
  end if;
end $$;

grant baetee_medusa to postgres;
grant connect on database postgres to baetee_medusa;
create schema if not exists medusa authorization baetee_medusa;
alter schema medusa owner to baetee_medusa;
revoke all on schema medusa from public, anon, authenticated, service_role;
revoke all on all tables in schema medusa from public, anon, authenticated, service_role;
revoke all on all sequences in schema medusa from public, anon, authenticated, service_role;
revoke all on all routines in schema medusa from public, anon, authenticated, service_role;
alter default privileges for role baetee_medusa in schema medusa revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role baetee_medusa in schema medusa revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role baetee_medusa in schema medusa revoke all on routines from public, anon, authenticated, service_role;
alter role baetee_medusa set search_path = medusa, pg_catalog;

-- Set a strong unique login password privately, for example using psql's interactive:
-- \password baetee_medusa
-- Never save the real password in this SQL file or a shell command/history.
-- Keep "medusa" OUT of Supabase Data API exposed schemas.
