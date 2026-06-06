-- Ranking do Desafio Diario - PandaDigitacoes V2
--
-- Execute este arquivo no Supabase SQL Editor para adicionar os campos de ranking
-- e a view de ranking do Desafio Diario.
--
-- Requer que supabase/schema.sql ja tenha sido aplicado.
-- A tabela public.daily_challenge_results ja existe com unique(user_id, challenge_date).
-- Este arquivo APENAS adiciona os campos ausentes (idempotente), cria indexes,
-- adiciona policies publicas de ranking e cria a view de ranking.

-- ===========================================================================
-- PARTE 1: Adicionar campos de ranking ausentes (idempotente via DO blocks)
-- ===========================================================================

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_challenge_results'
      and column_name = 'valid_for_ranking'
  ) then
    alter table public.daily_challenge_results
      add column valid_for_ranking boolean not null default false;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_challenge_results'
      and column_name = 'ranking_score'
  ) then
    alter table public.daily_challenge_results
      add column ranking_score numeric not null default 0;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_challenge_results'
      and column_name = 'ranking_invalid_reason'
  ) then
    alter table public.daily_challenge_results
      add column ranking_invalid_reason text;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_challenge_results'
      and column_name = 'ranking_invalid_reasons'
  ) then
    alter table public.daily_challenge_results
      add column ranking_invalid_reasons jsonb not null default '[]'::jsonb;
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'daily_challenge_results'
      and column_name = 'suspicious_flags'
  ) then
    alter table public.daily_challenge_results
      add column suspicious_flags jsonb not null default '{}'::jsonb;
  end if;
end $$;

-- ===========================================================================
-- PARTE 2: Indexes para ranking diario
-- ===========================================================================

create index if not exists idx_daily_challenge_results_date
  on public.daily_challenge_results (challenge_date);

create index if not exists idx_daily_challenge_results_user_date
  on public.daily_challenge_results (user_id, challenge_date);

create index if not exists idx_daily_challenge_results_ranking
  on public.daily_challenge_results (valid_for_ranking, ranking_score desc, challenge_date desc)
  where valid_for_ranking = true;

-- ===========================================================================
-- PARTE 3: Grants e policies publicas para ranking
--
-- O schema.sql ja tem policies para o usuario ler/inserir/atualizar
-- os proprios resultados. Aqui adicionamos leitura publica de resultados
-- elegiveis para o ranking, seguindo o mesmo padrao de typing_results
-- em ranking_views.sql.
-- ===========================================================================

grant select on public.daily_challenge_results to anon;
grant select on public.daily_challenge_results to authenticated;

drop policy if exists "Public can read eligible daily challenge ranking" on public.daily_challenge_results;
create policy "Public can read eligible daily challenge ranking"
on public.daily_challenge_results
for select
to anon, authenticated
using (
  valid_for_ranking = true
  and user_id is not null
);

-- ===========================================================================
-- PARTE 4: View de Ranking do Desafio Diario
--
-- Usa row_number() PARTITION BY (user_id, challenge_date) por consistencia
-- com as demais views, mesmo que a constraint unique(user_id, challenge_date)
-- ja garanta apenas uma linha por usuario por dia. Isso preserva a logica
-- caso a constraint seja relaxada no futuro para permitir multiplas tentativas.
-- ===========================================================================

create or replace view public.online_daily_challenge_ranking
with (security_invoker = true)
as
with ranked as (
  select
    dcr.id,
    dcr.user_id,
    coalesce(nullif(p.username, ''), 'panda_user') as username,
    coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Aprendiz do Dojo') as display_name,
    p.avatar_url,
    coalesce(nullif(p.title, ''), 'Filhote de Panda') as title,
    'daily_challenge'::text as mode,
    null::text as lesson_id,
    null::text as practice_text_id,
    dcr.challenge_id as daily_challenge_id,
    dcr.challenge_date,
    dcr.ppm,
    dcr.cpm,
    dcr.accuracy,
    dcr.errors,
    dcr.max_combo,
    dcr.duration_seconds,
    dcr.ranking_score,
    dcr.valid_for_ranking,
    dcr.completed_at,
    dcr.completed_at as created_at,
    row_number() over (
      partition by dcr.user_id, dcr.challenge_date
      order by
        dcr.ranking_score desc,
        dcr.ppm desc,
        dcr.accuracy desc,
        dcr.max_combo desc,
        dcr.completed_at asc
    ) as rn
  from public.daily_challenge_results dcr
  join public.profiles p on p.id = dcr.user_id
  where dcr.valid_for_ranking = true
    and dcr.user_id is not null
    and dcr.challenge_date is not null
)
select
  id,
  user_id,
  username,
  display_name,
  avatar_url,
  title,
  mode,
  lesson_id,
  practice_text_id,
  daily_challenge_id,
  ppm,
  cpm,
  accuracy,
  errors,
  max_combo,
  duration_seconds,
  ranking_score,
  valid_for_ranking,
  completed_at,
  created_at
from ranked
where rn = 1;

grant select on public.online_daily_challenge_ranking to anon;
grant select on public.online_daily_challenge_ranking to authenticated;

comment on view public.online_daily_challenge_ranking is
  'Ranking do Desafio Diario com o melhor resultado por usuario por dia (partition by user_id, challenge_date). Apenas resultados com valid_for_ranking = true.';

-- ===========================================================================
-- Verificacao rapida apos aplicar:
--
-- select challenge_date, count(*) as entradas, count(distinct user_id) as usuarios
-- from public.online_daily_challenge_ranking
-- group by challenge_date
-- order by challenge_date desc;
--
-- Cada user_id deve aparecer no maximo uma vez por challenge_date.
-- select * from public.online_daily_challenge_ranking
-- where challenge_date = current_date
-- order by ranking_score desc
-- limit 20;
-- ===========================================================================
