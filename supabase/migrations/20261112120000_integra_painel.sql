-- INTEGRA | Ansiedade: Painel da Rosa, "Sua voz importa", avaliações e estatísticas anônimas.
--
-- Princípios:
-- * Nada de diário, fotos, gravações ou registros emocionais vem para cá.
-- * Estatísticas só de quem consentiu no app. Identificadores são aleatórios (sem nome, e-mail ou IP).
-- * Toda escrita pública passa por funções que validam e limitam o que entra (sem INSERT direto).
-- * Leitura e alteração de dados: somente administradoras listadas em public.admins (RLS).

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- =====================================================================
-- Tabelas
-- =====================================================================

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (name in (
    'app_opened', 'page_viewed', 'category_opened', 'exercise_started', 'exercise_completed',
    'exercise_feedback_submitted', 'quiz_started', 'quiz_step_completed', 'quiz_completed',
    'journey_started', 'journey_completed', 'whatsapp_button_clicked', 'suggestion_submitted')),
  visitor_id uuid not null,
  session_id uuid not null,
  page text check (page is null or (char_length(page) <= 80 and page ~ '^/[a-z0-9/:_-]*$')),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object')
);
create index events_created_idx on public.events (created_at);
create index events_name_created_idx on public.events (name, created_at);
create index events_visitor_idx on public.events (visitor_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  category text not null check (category in ('sugestao', 'duvida', 'problema', 'elogio')),
  body text not null check (char_length(btrim(body)) between 5 and 2000),
  name text check (name is null or char_length(name) <= 80),
  email text check (email is null or (char_length(email) <= 200 and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')),
  status text not null default 'nova' check (status in ('nova', 'em_analise', 'respondida', 'arquivada')),
  visitor_id uuid not null
);
create index messages_created_idx on public.messages (created_at desc);

create table public.exercise_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  visitor_id uuid not null,
  exercise_id text not null check (exercise_id ~ '^[a-z0-9-]{1,60}$'),
  usefulness text not null check (usefulness in ('ajudou', 'um-pouco', 'nao-ajudou')),
  comment text check (comment is null or char_length(comment) between 1 and 500)
);
create index exercise_feedback_created_idx on public.exercise_feedback (created_at);

create table public.quiz_shares (
  visitor_id uuid primary key,
  created_at timestamptz not null default now(),
  answers jsonb not null check (jsonb_typeof(answers) = 'object')
);

-- Controle de envio (anti-spam). Guarda só hashes, apagados após 2 dias.
create table public.rate_limits (
  id bigint generated always as identity primary key,
  bucket text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_lookup_idx on public.rate_limits (bucket, key_hash, created_at);

alter table public.admins enable row level security;
alter table public.events enable row level security;
alter table public.messages enable row level security;
alter table public.exercise_feedback enable row level security;
alter table public.quiz_shares enable row level security;
alter table public.rate_limits enable row level security;

-- Defesa em profundidade: nenhum acesso direto por padrão (o Supabase concede tudo em public).
revoke all on public.admins, public.events, public.messages, public.exercise_feedback, public.quiz_shares, public.rate_limits from anon, authenticated, public;
revoke all on sequence public.events_id_seq, public.rate_limits_id_seq from anon, authenticated, public;

-- =====================================================================
-- Funções auxiliares
-- =====================================================================

create function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- Conta e registra uma tentativa; devolve true se ainda está dentro do limite.
create function public._within_limit(p_bucket text, p_key text, p_max int, p_window interval)
returns boolean
language plpgsql security definer
set search_path = ''
as $$
declare
  v_hash text := encode(extensions.digest(p_bucket || ':' || coalesce(p_key, '-'), 'sha256'), 'hex');
  v_count int;
begin
  select count(*) into v_count from public.rate_limits
   where bucket = p_bucket and key_hash = v_hash and created_at > now() - p_window;
  if v_count >= p_max then
    return false;
  end if;
  insert into public.rate_limits (bucket, key_hash) values (p_bucket, v_hash);
  return true;
end;
$$;

-- IP do pedido (cabeçalho do PostgREST), usado só como hash para limitar envios.
create function public._client_ip()
returns text
language sql stable
set search_path = ''
as $$
  select split_part(coalesce(nullif(current_setting('request.headers', true), '')::json ->> 'x-forwarded-for', ''), ',', 1);
$$;

create function public._is_slug(v text)
returns boolean language sql immutable set search_path = ''
as $$ select v is not null and v ~ '^[a-z0-9-]{1,60}$' $$;

-- Mantém somente chaves conhecidas, com valores curtos e sem texto livre.
create function public._clean_props(p jsonb)
returns jsonb
language plpgsql immutable
set search_path = ''
as $$
declare
  out jsonb := '{}'::jsonb;
  k text;
  v jsonb;
begin
  if p is null or jsonb_typeof(p) <> 'object' then
    return out;
  end if;
  for k, v in select * from jsonb_each(p) loop
    if k in ('exercise_id', 'category_id', 'journey_id', 'step_key', 'topic', 'usefulness', 'source', 'pillar')
       and jsonb_typeof(v) = 'string' and public._is_slug(v #>> '{}') then
      out := out || jsonb_build_object(k, v);
    elsif k in ('step', 'day', 'total')
       and jsonb_typeof(v) = 'number' and (v #>> '{}') ~ '^[0-9]{1,3}$' then
      out := out || jsonb_build_object(k, v);
    end if;
  end loop;
  return out;
end;
$$;

-- =====================================================================
-- Funções públicas (app)
-- =====================================================================

-- Registra até 50 eventos de uma vez. Eventos inválidos são ignorados.
create function public.log_events(p_events jsonb)
returns int
language plpgsql security definer
set search_path = ''
as $$
declare
  e jsonb;
  n int := 0;
  v_visitor uuid;
  v_session uuid;
  v_page text;
begin
  if p_events is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) > 50 then
    raise exception 'invalid_batch' using errcode = '22023';
  end if;
  for e in select * from jsonb_array_elements(p_events) loop
    begin
      v_visitor := (e ->> 'visitor_id')::uuid;
      v_session := (e ->> 'session_id')::uuid;
    exception when others then
      continue;
    end;
    if v_visitor is null or v_session is null then continue; end if;
    if not public._within_limit('events', v_visitor::text, 500, interval '1 hour') then
      continue;
    end if;
    v_page := e ->> 'page';
    if v_page is not null and (char_length(v_page) > 80 or v_page !~ '^/[a-z0-9/:_-]*$') then
      v_page := null;
    end if;
    begin
      insert into public.events (name, visitor_id, session_id, page, props)
      values (e ->> 'name', v_visitor, v_session, v_page, public._clean_props(e -> 'props'));
      n := n + 1;
    exception when check_violation or not_null_violation then
      -- nome de evento desconhecido: ignora
      null;
    end;
  end loop;
  return n;
end;
$$;

-- "Sua voz importa". Devolve 'ok'. Erros: rate_limited, invalid_message.
create function public.submit_message(
  p_category text, p_body text, p_name text, p_email text, p_visitor uuid,
  p_website text default null, p_elapsed_ms int default null
)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  v_ip text := public._client_ip();
begin
  -- Armadilhas para robôs: responde 'ok' sem gravar, para não dar pistas.
  if coalesce(p_website, '') <> '' or coalesce(p_elapsed_ms, 0) < 3000 then
    return 'ok';
  end if;
  if p_visitor is null then
    raise exception 'invalid_message' using errcode = '22023';
  end if;
  if not public._within_limit('msg-visitor-hour', p_visitor::text, 3, interval '1 hour')
     or not public._within_limit('msg-visitor-day', p_visitor::text, 10, interval '1 day')
     or (v_ip <> '' and not public._within_limit('msg-ip-hour', v_ip, 6, interval '1 hour'))
     or not public._within_limit('msg-global-hour', 'all', 120, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  begin
    insert into public.messages (category, body, name, email, visitor_id)
    values (p_category, btrim(p_body), nullif(btrim(coalesce(p_name, '')), ''), nullif(lower(btrim(coalesce(p_email, ''))), ''), p_visitor);
  exception when check_violation or not_null_violation then
    raise exception 'invalid_message' using errcode = '22023';
  end;
  return 'ok';
end;
$$;

-- Avaliação de uma prática. O comentário só vem se a pessoa marcou para enviar.
create function public.submit_exercise_feedback(p_visitor uuid, p_exercise text, p_usefulness text, p_comment text default null)
returns text
language plpgsql security definer
set search_path = ''
as $$
begin
  if p_visitor is null or not public._within_limit('feedback', p_visitor::text, 60, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  begin
    insert into public.exercise_feedback (visitor_id, exercise_id, usefulness, comment)
    values (p_visitor, p_exercise, p_usefulness, nullif(btrim(coalesce(p_comment, '')), ''));
  exception when check_violation or not_null_violation then
    raise exception 'invalid_feedback' using errcode = '22023';
  end;
  return 'ok';
end;
$$;

-- Compartilhamento voluntário das respostas dos primeiros passos (só valores de opções, nunca texto livre).
create function public.share_quiz(p_visitor uuid, p_answers jsonb)
returns text
language plpgsql security definer
set search_path = ''
as $$
declare
  allowed jsonb := '{
    "hardest": ["falar-em-publico","ansiedade-social","sono","pensamentos-acelerados","trabalho","perfeccionismo","sensacoes-fisicas","provas-entrevistas","sobrecarga","irritabilidade","mudancas","autocritica"],
    "usualLevel": ["1-3","4-6","7-8","9-10"],
    "frequency": ["quase-todo-dia","algumas-vezes","poucas-forte"],
    "moment": ["trabalho","noite","social","sem-motivo"],
    "firstSign": ["mente","corpo","respiracao"],
    "tried": ["respirar","meditacao","terapia","nada"],
    "avoid": ["as-vezes","sempre","foi-mesmo-assim","nao"],
    "self": ["sozinha","irritada","falhando","pouco"],
    "frustration": ["nao-consegue","sem-ideia","vergonha","estagnada"],
    "change": ["paz","sono","conquistar","confianca"],
    "length": ["curtos","longos","tanto-faz"],
    "heard": ["sim","mais-ou-menos","nunca"]
  }'::jsonb;
  clean jsonb := '{}'::jsonb;
  k text;
  v jsonb;
  item jsonb;
  arr jsonb;
begin
  if p_visitor is null or p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'invalid_answers' using errcode = '22023';
  end if;
  if not public._within_limit('quiz', p_visitor::text, 10, interval '1 day') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  for k, v in select * from jsonb_each(p_answers) loop
    continue when not allowed ? k;
    if k = 'hardest' and jsonb_typeof(v) = 'array' then
      arr := '[]'::jsonb;
      for item in select * from jsonb_array_elements(v) loop
        if jsonb_typeof(item) = 'string' and (allowed -> k) ? (item #>> '{}') and jsonb_array_length(arr) < 3 then
          arr := arr || jsonb_build_array(item);
        end if;
      end loop;
      if jsonb_array_length(arr) > 0 then clean := clean || jsonb_build_object(k, arr); end if;
    elsif jsonb_typeof(v) = 'string' and (allowed -> k) ? (v #>> '{}') then
      clean := clean || jsonb_build_object(k, v);
    end if;
  end loop;
  insert into public.quiz_shares (visitor_id, answers) values (p_visitor, clean)
  on conflict (visitor_id) do update set answers = excluded.answers, created_at = now();
  return 'ok';
end;
$$;

-- Apaga o que este aparelho enviou. p_scope: 'quiz' (só respostas compartilhadas) ou 'tudo'.
create function public.delete_my_data(p_visitor uuid, p_scope text default 'tudo')
returns text
language plpgsql security definer
set search_path = ''
as $$
begin
  if p_visitor is null or p_scope not in ('quiz', 'tudo') then
    raise exception 'invalid_request' using errcode = '22023';
  end if;
  if not public._within_limit('delete', p_visitor::text, 20, interval '1 hour') then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  delete from public.quiz_shares where visitor_id = p_visitor;
  if p_scope = 'tudo' then
    delete from public.events where visitor_id = p_visitor;
    delete from public.exercise_feedback where visitor_id = p_visitor;
    delete from public.messages where visitor_id = p_visitor;
  end if;
  return 'ok';
end;
$$;

-- =====================================================================
-- Painel da Rosa (somente administradoras)
-- =====================================================================

create function public.admin_stats(p_from timestamptz, p_to timestamptz)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  r jsonb;
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  if p_from is null or p_to is null or p_to <= p_from or p_to - p_from > interval '400 days' then
    raise exception 'invalid_period' using errcode = '22023';
  end if;

  with ev as (
    select * from public.events where created_at >= p_from and created_at < p_to
  )
  select jsonb_build_object(
    'from', p_from, 'to', p_to,
    'totals', (select jsonb_build_object(
        'visitors', count(distinct visitor_id),
        'sessions', count(distinct session_id),
        'events', count(*),
        'active_visitors', (select count(*) from (
            select visitor_id from ev group by visitor_id having count(distinct (created_at at time zone 'America/Sao_Paulo')::date) >= 2) a)
      ) from ev),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('day', d, 'visitors', v, 'sessions', s) order by d) from (
        select (created_at at time zone 'America/Sao_Paulo')::date d, count(distinct visitor_id) v, count(distinct session_id) s
        from ev group by 1) x), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(jsonb_build_object('page', page, 'views', c, 'visitors', v) order by c desc) from (
        select page, count(*) c, count(distinct visitor_id) v from ev where name = 'page_viewed' and page is not null
        group by page order by c desc limit 30) x), '[]'::jsonb),
    'exercises', coalesce((select jsonb_agg(jsonb_build_object('exercise_id', ex, 'opened', o, 'started', s, 'completed', c) order by s desc, o desc) from (
        select ex, sum(o) o, sum(s) s, sum(c) c from (
          select substring(page from '^/praticar/([a-z0-9-]+)$') ex, 1 o, 0 s, 0 c from ev where name = 'page_viewed' and page ~ '^/praticar/[a-z0-9-]+$'
          union all select props ->> 'exercise_id', 0, 1, 0 from ev where name = 'exercise_started'
          union all select props ->> 'exercise_id', 0, 0, 1 from ev where name = 'exercise_completed'
        ) u where ex is not null group by ex) x), '[]'::jsonb),
    'categories', coalesce((select jsonb_agg(jsonb_build_object('category_id', k, 'opened', c, 'visitors', v) order by c desc) from (
        select props ->> 'category_id' k, count(*) c, count(distinct visitor_id) v from ev
        where name = 'category_opened' and props ? 'category_id' group by 1) x), '[]'::jsonb),
    'journeys', coalesce((select jsonb_agg(jsonb_build_object('journey_id', k, 'started', s, 'completed', c) order by s desc) from (
        select props ->> 'journey_id' k, count(*) filter (where name = 'journey_started') s, count(*) filter (where name = 'journey_completed') c
        from ev where name in ('journey_started', 'journey_completed') and props ? 'journey_id' group by 1) x), '[]'::jsonb),
    'quiz', jsonb_build_object(
        'started', (select count(distinct session_id) from ev where name = 'quiz_started'),
        'completed', (select count(distinct session_id) from ev where name = 'quiz_completed'),
        'steps', coalesce((select jsonb_agg(jsonb_build_object('step', st, 'step_key', sk, 'sessions', c) order by st) from (
            select (props ->> 'step')::int st, max(props ->> 'step_key') sk, count(distinct session_id) c
            from ev where name = 'quiz_step_completed' and props ? 'step' group by 1) x), '[]'::jsonb)),
    'whatsapp', coalesce((select jsonb_agg(jsonb_build_object('topic', k, 'clicks', c) order by c desc) from (
        select props ->> 'topic' k, count(*) c from ev where name = 'whatsapp_button_clicked' and props ? 'topic' group by 1) x), '[]'::jsonb),
    'suggestions_submitted', (select count(*) from ev where name = 'suggestion_submitted'),
    'feedback', coalesce((select jsonb_agg(jsonb_build_object('exercise_id', exercise_id, 'ajudou', a, 'um_pouco', b, 'nao_ajudou', n, 'comments', cm) order by (a + b + n) desc) from (
        select exercise_id,
          count(*) filter (where usefulness = 'ajudou') a,
          count(*) filter (where usefulness = 'um-pouco') b,
          count(*) filter (where usefulness = 'nao-ajudou') n,
          count(comment) cm
        from public.exercise_feedback where created_at >= p_from and created_at < p_to group by exercise_id) x), '[]'::jsonb),
    'quiz_shares', jsonb_build_object(
        'total', (select count(*) from public.quiz_shares where created_at >= p_from and created_at < p_to),
        'answers', coalesce((select jsonb_agg(jsonb_build_object('question', q, 'answer', a, 'count', c) order by q, c desc) from (
            select kv.key q, coalesce(arr.value, kv.value) #>> '{}' a, count(*) c
            from public.quiz_shares s
            cross join lateral jsonb_each(s.answers) kv
            left join lateral jsonb_array_elements(case when jsonb_typeof(kv.value) = 'array' then kv.value else '[]'::jsonb end) arr on true
            where s.created_at >= p_from and s.created_at < p_to
              and (jsonb_typeof(kv.value) <> 'array' or arr.value is not null)
            group by 1, 2) x), '[]'::jsonb)),
    'messages', (select jsonb_build_object(
        'total', count(*),
        'nova', count(*) filter (where status = 'nova'),
        'em_analise', count(*) filter (where status = 'em_analise'),
        'respondida', count(*) filter (where status = 'respondida'),
        'arquivada', count(*) filter (where status = 'arquivada'))
      from public.messages where created_at >= p_from and created_at < p_to)
  ) into r;
  return r;
end;
$$;

-- Leitura e classificação pelo painel (RLS).
create policy admins_read_self on public.admins for select to authenticated using (user_id = auth.uid());
create policy messages_admin_read on public.messages for select to authenticated using (public.is_admin());
create policy messages_admin_update on public.messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy feedback_admin_read on public.exercise_feedback for select to authenticated using (public.is_admin());

grant select on public.admins to authenticated;
grant select on public.messages to authenticated;
grant update (status, updated_at) on public.messages to authenticated;
grant select on public.exercise_feedback to authenticated;

-- updated_at automático
create function public._touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end; $$;
create trigger messages_touch before update on public.messages for each row execute function public._touch_updated_at();

-- =====================================================================
-- Retenção: eventos por 13 meses, controle de envio por 2 dias.
-- Agendar no Supabase (Database → Cron): select public.purge_old_data(); diariamente.
-- =====================================================================
create function public.purge_old_data()
returns void language sql security definer set search_path = ''
as $$
  delete from public.events where created_at < now() - interval '400 days';
  delete from public.rate_limits where created_at < now() - interval '2 days';
$$;

-- Permissões de execução: o Postgres concede EXECUTE a PUBLIC por padrão; remove tudo e libera só o necessário.
revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on function public.log_events(jsonb) to anon, authenticated;
grant execute on function public.submit_message(text, text, text, text, uuid, text, int) to anon, authenticated;
grant execute on function public.submit_exercise_feedback(uuid, text, text, text) to anon, authenticated;
grant execute on function public.share_quiz(uuid, jsonb) to anon, authenticated;
grant execute on function public.delete_my_data(uuid, text) to anon, authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_stats(timestamptz, timestamptz) to authenticated;
