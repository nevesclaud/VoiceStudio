#!/usr/bin/env bash
# Testa a migração do Supabase num Postgres local descartável.
# Uso: PGHOST=<socket ou host> PGPORT=<porta> PGUSER=postgres npm run test:db
set -euo pipefail
DB="integra_test_$$"
cd "$(dirname "$0")/.."
psql -q -v ON_ERROR_STOP=1 -d postgres -c "create database $DB" >/dev/null
trap 'psql -q -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
# papéis são globais no cluster: cria só se não existirem
psql -q -v ON_ERROR_STOP=1 -d "$DB" -c "do \$\$ begin if exists (select 1 from pg_roles where rolname='anon') then raise notice 'papéis já existem'; end if; end \$\$" >/dev/null
if psql -tA -d "$DB" -c "select 1 from pg_roles where rolname='anon'" | grep -q 1; then
  sed '/^create role/d' supabase/tests/00_supabase_local.sql | psql -q -v ON_ERROR_STOP=1 -d "$DB" >/dev/null
else
  psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/00_supabase_local.sql >/dev/null
fi
for f in supabase/migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" >/dev/null; done
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/tests/10_security.sql 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  /'
