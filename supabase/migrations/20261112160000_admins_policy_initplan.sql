-- Desempenho (aviso do Supabase "auth_rls_initplan"): avalia auth.uid() uma vez por consulta,
-- e não uma vez por linha. Não muda quem pode ver o quê.
drop policy if exists admins_read_self on public.admins;
create policy admins_read_self on public.admins for select to authenticated using (user_id = (select auth.uid()));
