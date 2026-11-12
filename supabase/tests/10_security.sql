-- Testes de segurança e funcionamento. Cada bloco falha com exceção se algo estiver errado.
\set ON_ERROR_STOP on
\pset tuples_only on
\pset format unaligned

-- Dados de apoio (como superusuário)
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000a001', 'rosa@example.com'),
  ('00000000-0000-0000-0000-00000000b002', 'outra@example.com');
insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000a001');

create or replace function pg_temp.expect_error(sql text, label text) returns void language plpgsql as $$
begin
  begin
    execute sql;
  exception when others then
    raise notice 'ok (bloqueado): %', label;
    return;
  end;
  raise exception 'FALHOU: deveria ter sido bloqueado: %', label;
end $$;

create or replace function pg_temp.check(cond boolean, label text) returns void language plpgsql as $$
begin
  if cond is distinct from true then raise exception 'FALHOU: %', label; end if;
  raise notice 'ok: %', label;
end $$;

-- ============ Visitante anônimo ============
set role anon;
select pg_temp.expect_error('select * from public.events', 'anon não lê eventos');
select pg_temp.expect_error('select * from public.messages', 'anon não lê mensagens');
select pg_temp.expect_error('select * from public.quiz_shares', 'anon não lê respostas do quiz');
select pg_temp.expect_error('select * from public.exercise_feedback', 'anon não lê avaliações');
select pg_temp.expect_error('select * from public.admins', 'anon não lê administradoras');
select pg_temp.expect_error('select * from public.rate_limits', 'anon não lê controle de envio');
select pg_temp.expect_error($q$insert into public.events (name, visitor_id, session_id) values ('app_opened', gen_random_uuid(), gen_random_uuid())$q$, 'anon não insere eventos direto');
select pg_temp.expect_error($q$insert into public.messages (category, body, visitor_id) values ('elogio', 'mensagem direta', gen_random_uuid())$q$, 'anon não insere mensagens direto');
select pg_temp.expect_error($q$insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000b002')$q$, 'anon não se torna admin');
select pg_temp.expect_error($q$select public.admin_stats(now() - interval '1 day', now())$q$, 'anon não vê estatísticas');
select pg_temp.expect_error($q$select public._within_limit('x', 'y', 1, interval '1 hour')$q$, 'anon não chama funções internas');
select pg_temp.expect_error($q$select public.purge_old_data()$q$, 'anon não apaga dados antigos');

-- Eventos: só nomes conhecidos, props limpas (sem texto livre), página normalizada
select pg_temp.check(public.log_events(jsonb_build_array(
  jsonb_build_object('name','app_opened','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','page','/'),
  jsonb_build_object('name','page_viewed','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','page','/praticar/grounding'),
  jsonb_build_object('name','exercise_started','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111',
      'props', jsonb_build_object('exercise_id','grounding','texto','meu diário secreto','exercise_comment','Hoje chorei')),
  jsonb_build_object('name','exercise_completed','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('exercise_id','grounding')),
  jsonb_build_object('name','category_opened','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('category_id','sono')),
  jsonb_build_object('name','quiz_started','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111'),
  jsonb_build_object('name','quiz_step_completed','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('step',1,'step_key','form')),
  jsonb_build_object('name','quiz_step_completed','visitor_id','12222222-1111-1111-1111-111111111111','session_id','22222222-1111-1111-1111-111111111111','props', jsonb_build_object('step',1,'step_key','form')),
  jsonb_build_object('name','quiz_started','visitor_id','12222222-1111-1111-1111-111111111111','session_id','22222222-1111-1111-1111-111111111111'),
  jsonb_build_object('name','quiz_step_completed','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('step',2,'step_key','hardest')),
  jsonb_build_object('name','whatsapp_button_clicked','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('topic','presencial')),
  jsonb_build_object('name','journey_started','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','props', jsonb_build_object('journey_id','comecando')),
  jsonb_build_object('name','evento_inventado','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111'),
  jsonb_build_object('name','page_viewed','visitor_id','11111111-1111-1111-1111-111111111111','session_id','21111111-1111-1111-1111-111111111111','page','/diario/Texto Livre'),
  jsonb_build_object('name','app_opened','visitor_id','nao-e-uuid','session_id','21111111-1111-1111-1111-111111111111')
)) = 13, 'log_events aceita 13 válidos e ignora evento inventado e id inválido');
select pg_temp.expect_error($q$select public.log_events((select jsonb_agg(jsonb_build_object('name','app_opened')) from generate_series(1,51)))$q$, 'lote acima de 50 é recusado');

-- Mensagens: armadilha de robô, tempo mínimo, validação e limite
select pg_temp.check(public.submit_message('sugestao', 'Robô tentando', null, null, '31111111-1111-1111-1111-111111111111', 'http://spam', 9000) = 'ok', 'honeypot responde ok (sem gravar)');
select pg_temp.check(public.submit_message('sugestao', 'Rápido demais', null, null, '31111111-1111-1111-1111-111111111111', null, 500) = 'ok', 'envio instantâneo responde ok (sem gravar)');
select pg_temp.check(public.submit_message('sugestao', 'Poderia ter modo escuro.', 'Ana', 'Ana@Exemplo.com ', '31111111-1111-1111-1111-111111111111', '', 8000) = 'ok', 'mensagem válida 1');
select pg_temp.check(public.submit_message('duvida', 'Como instalo no iPhone?', null, null, '31111111-1111-1111-1111-111111111111', null, 8000) = 'ok', 'mensagem válida 2');
select pg_temp.check(public.submit_message('elogio', 'Gostei muito das trilhas.', null, null, '31111111-1111-1111-1111-111111111111', null, 8000) = 'ok', 'mensagem válida 3');
select pg_temp.expect_error($q$select public.submit_message('elogio', 'Quarta mensagem na mesma hora', null, null, '31111111-1111-1111-1111-111111111111', null, 8000)$q$, 'limite de 3 por hora por aparelho');
select pg_temp.expect_error($q$select public.submit_message('elogio', 'oi', null, null, '41111111-1111-1111-1111-111111111111', null, 8000)$q$, 'mensagem curta demais');
select pg_temp.expect_error($q$select public.submit_message('elogio', repeat('a', 2001), null, null, '41111111-1111-1111-1111-111111111111', null, 8000)$q$, 'mensagem longa demais');
select pg_temp.expect_error($q$select public.submit_message('elogio', 'E-mail inválido aqui', null, 'nao-e-email', '41111111-1111-1111-1111-111111111111', null, 8000)$q$, 'e-mail inválido');
select pg_temp.expect_error($q$select public.submit_message('vendas', 'Categoria inexistente', null, null, '41111111-1111-1111-1111-111111111111', null, 8000)$q$, 'categoria inválida');

-- Avaliações e quiz
select pg_temp.check(public.submit_exercise_feedback('11111111-1111-1111-1111-111111111111', 'grounding', 'ajudou', null) = 'ok', 'avaliação sem comentário');
select pg_temp.check(public.submit_exercise_feedback('11111111-1111-1111-1111-111111111111', 'grounding', 'um-pouco', 'Gostei da parte dos sons') = 'ok', 'avaliação com comentário');
select pg_temp.expect_error($q$select public.submit_exercise_feedback('11111111-1111-1111-1111-111111111111', 'grounding', 'otimo', null)$q$, 'avaliação inválida');
select pg_temp.check(public.share_quiz('11111111-1111-1111-1111-111111111111',
  '{"hardest":["sono","trabalho","inventada"],"usualLevel":"7-8","firstSign":"corpo","name":"Ana","diario":"segredo","change":"texto livre"}'::jsonb) = 'ok', 'compartilhar quiz');
select pg_temp.check(public.share_quiz('51111111-1111-1111-1111-111111111111', '{"hardest":["sono"],"firstSign":"mente"}'::jsonb) = 'ok', 'compartilhar quiz 2');
reset role;

select pg_temp.check((select answers = '{"hardest":["sono","trabalho"],"usualLevel":"7-8","firstSign":"corpo"}'::jsonb from public.quiz_shares where visitor_id = '11111111-1111-1111-1111-111111111111'), 'quiz guarda só opções conhecidas (sem nome, diário ou texto livre)');
select pg_temp.check((select props = '{"exercise_id":"grounding"}'::jsonb from public.events where name = 'exercise_started'), 'evento sem texto livre nas props');
select pg_temp.check((select page is null from public.events where name = 'page_viewed' and page is distinct from '/praticar/grounding'), 'página com texto livre é descartada');
select pg_temp.check((select count(*) = 3 from public.messages), 'só 3 mensagens gravadas (robôs e excessos fora)');
select pg_temp.check((select email = 'ana@exemplo.com' from public.messages where name = 'Ana'), 'e-mail normalizado');
select pg_temp.check((select bool_and(key_hash ~ '^[0-9a-f]{64}$') from public.rate_limits), 'controle de envio guarda só hashes');

-- ============ Usuária autenticada que NÃO é admin ============
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000b002';
select pg_temp.check(not public.is_admin(), 'outra conta não é admin');
select pg_temp.check((select count(*) = 0 from public.messages), 'não-admin não vê mensagens');
select pg_temp.check((select count(*) = 0 from public.exercise_feedback), 'não-admin não vê avaliações');
select pg_temp.expect_error($q$select public.admin_stats(now() - interval '1 day', now() + interval '1 minute')$q$, 'não-admin não vê estatísticas');
select pg_temp.expect_error('select * from public.events', 'não-admin não lê eventos');
select pg_temp.expect_error('select * from public.quiz_shares', 'não-admin não lê quiz');
update public.messages set status = 'arquivada';
reset role;
select pg_temp.check((select count(*) = 0 from public.messages where status = 'arquivada'), 'não-admin não altera status');

-- ============ Administradora ============
set role authenticated;
set request.jwt.claim.sub = '00000000-0000-0000-0000-00000000a001';
select pg_temp.check(public.is_admin(), 'Rosa é admin');
select pg_temp.check((select count(*) = 3 from public.messages), 'admin vê as mensagens');
select pg_temp.check((select count(*) = 2 from public.exercise_feedback), 'admin vê as avaliações');
update public.messages set status = 'em_analise' where name = 'Ana';
select pg_temp.expect_error($q$update public.messages set body = 'alterado' where name = 'Ana'$q$, 'admin não altera o texto da mensagem');
select pg_temp.expect_error($q$update public.messages set status = 'apagada' where name = 'Ana'$q$, 'status inválido recusado');
select pg_temp.expect_error($q$delete from public.messages$q$, 'admin não apaga mensagens pelo painel');
select pg_temp.expect_error($q$insert into public.admins (user_id) values ('00000000-0000-0000-0000-00000000b002')$q$, 'admin não cria outra admin pelo app');
select pg_temp.expect_error('select * from public.events', 'nem a admin lê eventos individuais (só agregados)');
select pg_temp.expect_error($q$select public.admin_stats(now(), now() - interval '1 day')$q$, 'período inválido');
do $$
declare s jsonb := public.admin_stats(now() - interval '1 day', now() + interval '1 minute');
begin
  perform pg_temp.check((s #>> '{totals,visitors}')::int = 2, 'visitantes = 2');
  perform pg_temp.check((s #>> '{totals,sessions}')::int = 2, 'sessões = 2');
  perform pg_temp.check((s #>> '{quiz,started}')::int = 2 and (s #>> '{quiz,completed}')::int = 0, 'quiz iniciado 2, concluído 0');
  perform pg_temp.check(s -> 'quiz' -> 'steps' = '[{"step":1,"step_key":"form","sessions":2},{"step":2,"step_key":"hardest","sessions":1}]'::jsonb, 'funil do quiz por etapa');
  perform pg_temp.check(s -> 'exercises' = '[{"exercise_id":"grounding","opened":1,"started":1,"completed":1}]'::jsonb, 'exercícios abertos, iniciados e concluídos');
  perform pg_temp.check(s -> 'whatsapp' = '[{"topic":"presencial","clicks":1}]'::jsonb, 'cliques no WhatsApp');
  perform pg_temp.check(s -> 'categories' = '[{"category_id":"sono","opened":1,"visitors":1}]'::jsonb, 'áreas mais procuradas');
  perform pg_temp.check(s -> 'journeys' = '[{"journey_id":"comecando","started":1,"completed":0}]'::jsonb, 'jornadas');
  perform pg_temp.check(s -> 'feedback' = '[{"exercise_id":"grounding","ajudou":1,"um_pouco":1,"nao_ajudou":0,"comments":1}]'::jsonb, 'avaliações agrupadas');
  perform pg_temp.check((s #>> '{quiz_shares,total}')::int = 2, 'respostas compartilhadas = 2');
  perform pg_temp.check(s -> 'quiz_shares' -> 'answers' @> '[{"question":"hardest","answer":"sono","count":2}]'::jsonb, 'situação mais marcada');
  perform pg_temp.check(s -> 'messages' = '{"total":3,"nova":2,"em_analise":1,"respondida":0,"arquivada":0}'::jsonb, 'mensagens por status');
end $$;
reset role;

-- ============ Revogação pelo próprio aparelho ============
set role anon;
select pg_temp.check(public.delete_my_data('51111111-1111-1111-1111-111111111111', 'quiz') = 'ok', 'revogar compartilhamento do quiz');
select pg_temp.check(public.delete_my_data('11111111-1111-1111-1111-111111111111', 'tudo') = 'ok', 'apagar tudo deste aparelho');
reset role;
select pg_temp.check((select count(*) = 0 from public.quiz_shares), 'respostas do quiz apagadas');
select pg_temp.check((select count(*) = 0 from public.events where visitor_id = '11111111-1111-1111-1111-111111111111'), 'eventos do aparelho apagados');
select pg_temp.check((select count(*) = 0 from public.exercise_feedback), 'avaliações do aparelho apagadas');
select pg_temp.check((select count(*) = 2 from public.events), 'eventos de outro aparelho continuam');

\echo 'TODOS OS TESTES DE SEGURANÇA PASSARAM'
