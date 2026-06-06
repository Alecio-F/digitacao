-- Ranking Online Inicial - PandaDigitacoes V2
--
-- Execute este arquivo depois de supabase/schema.sql.
-- As views expoem somente campos necessarios para o mural online e mantem
-- dados sensiveis fora do front-end.

create or replace view public.online_typing_ranking as
select
  tr.id,
  tr.user_id,
  coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Aprendiz do Dojo') as display_name,
  coalesce(nullif(p.username, ''), 'panda_user') as username,
  coalesce(nullif(p.title, ''), 'Filhote de Panda') as title,
  tr.mode,
  tr.lesson_id,
  tr.practice_text_id,
  tr.daily_challenge_id,
  tr.duration_seconds,
  tr.ppm,
  tr.cpm,
  tr.accuracy,
  tr.errors,
  tr.max_combo,
  tr.ranking_score,
  tr.valid_for_ranking,
  tr.completed_at
from public.typing_results tr
join public.profiles p on p.id = tr.user_id
where tr.valid_for_ranking = true;

grant select on public.online_typing_ranking to anon;
grant select on public.online_typing_ranking to authenticated;

create index if not exists typing_results_online_ranking_idx
on public.typing_results (
  valid_for_ranking,
  ranking_score desc,
  ppm desc,
  accuracy desc,
  completed_at desc
);

comment on view public.online_typing_ranking is
  'Mural online publico com resultados elegiveis da Type Arena e campos minimos de perfil.';

-- Ranking Online Geral - melhor resultado por usuario.
--
-- Mantem a view antiga acima para compatibilidade. Esta view retorna apenas o
-- melhor resultado elegivel de cada usuario para o Ranking Online Geral,
-- evitando que a mesma pessoa apareca repetida no mural.

create or replace view public.online_typing_ranking_best
with (security_invoker = true)
as
with ranked as (
  select
    tr.id,
    tr.user_id,
    coalesce(nullif(p.username, ''), 'panda_user') as username,
    coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Aprendiz do Dojo') as display_name,
    p.avatar_url,
    coalesce(nullif(p.title, ''), 'Filhote de Panda') as title,
    tr.mode,
    tr.lesson_id,
    tr.practice_text_id,
    tr.daily_challenge_id,
    tr.duration_seconds,
    tr.ppm,
    tr.cpm,
    tr.accuracy,
    tr.errors,
    tr.max_combo,
    ((tr.ppm::numeric * 0.7) + (tr.accuracy * 0.3)) as ranking_score,
    tr.valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    row_number() over (
      partition by tr.user_id
      order by
        ((tr.ppm::numeric * 0.7) + (tr.accuracy * 0.3)) desc,
        tr.ppm desc,
        tr.accuracy desc,
        tr.completed_at asc
    ) as rn
  from public.typing_results tr
  join public.profiles p on p.id = tr.user_id
  where tr.valid_for_ranking = true
    and tr.user_id is not null
    and tr.ppm is not null
    and tr.accuracy is not null
    and tr.accuracy >= 90
    and tr.duration_seconds >= 15
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

grant select on public.online_typing_ranking_best to anon;
grant select on public.online_typing_ranking_best to authenticated;

create index if not exists typing_results_online_ranking_best_idx
on public.typing_results (
  user_id,
  valid_for_ranking,
  ppm desc,
  accuracy desc,
  completed_at asc
)
where valid_for_ranking = true;

comment on view public.online_typing_ranking_best is
  'Ranking Online Geral com apenas o melhor resultado elegivel por usuario, calculado por score = PPM 70% + precisao 30%.';
