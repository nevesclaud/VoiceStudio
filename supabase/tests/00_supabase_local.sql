-- Simula, num Postgres local, o mínimo do Supabase para testar a migração:
-- papéis anon/authenticated, schema auth com auth.uid() e as concessões padrão do schema public.
-- NÃO rodar no Supabase de verdade.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(current_setting('request.jwt.claim.sub', true), current_setting('request.jwt.claims', true)::json ->> 'sub'), '')::uuid
$$;
grant usage on schema auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
grant usage on schema public to anon, authenticated;
-- Concessões padrão do Supabase (a migração precisa revogar o que não quer expor).
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
