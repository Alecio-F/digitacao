-- Ranking Online por Fases - PandaDigitacoes V2
--
-- Execute este arquivo no Supabase SQL Editor para adicionar o Ranking por Fases.
-- Requer que supabase/schema.sql e supabase/ranking_views.sql ja tenham sido aplicados.
--
-- Campo de fase: lesson_id (text, ex: 'base-keys', 'left-hand', 'right-hand')
-- Modo obrigatorio: mode = 'lesson'
-- Particao: (user_id, lesson_id) — um resultado por usuario por fase.
-- ranking_score: campo salvo pelo cliente (inclui velocidade, precisao e combo).

create or replace view public.online_typing_ranking_best_by_phase
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
    tr.ranking_score,
    tr.valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    row_number() over (
      partition by tr.user_id, tr.lesson_id
      order by
        tr.ranking_score desc,
        tr.ppm desc,
        tr.accuracy desc,
        tr.max_combo desc,
        tr.completed_at asc
    ) as rn
  from public.typing_results tr
  join public.profiles p on p.id = tr.user_id
  where tr.valid_for_ranking = true
    and tr.user_id is not null
    and tr.ppm is not null
    and tr.accuracy is not null
    and tr.mode = 'lesson'
    and tr.lesson_id is not null
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

grant select on public.online_typing_ranking_best_by_phase to anon;
grant select on public.online_typing_ranking_best_by_phase to authenticated;

comment on view public.online_typing_ranking_best_by_phase is
  'Ranking Online por Fases com o melhor resultado por usuario por fase (partition by user_id, lesson_id). Apenas resultados com valid_for_ranking = true, mode = lesson, accuracy >= 90 e duration >= 15 s.';

-- Verificacao rapida apos aplicar:
-- select lesson_id, count(*) as entradas, count(distinct user_id) as usuarios
-- from public.online_typing_ranking_best_by_phase
-- group by lesson_id
-- order by lesson_id;
--
-- Cada user_id deve aparecer no maximo uma vez por lesson_id.
-- select * from public.online_typing_ranking_best_by_phase limit 20;
