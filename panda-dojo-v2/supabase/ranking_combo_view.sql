-- Ranking Online de Combo - PandaDigitacoes V2
--
-- Execute este arquivo no Supabase SQL Editor para adicionar o Ranking de Combo.
-- Requer que supabase/schema.sql e supabase/ranking_views.sql ja tenham sido aplicados.
--
-- Campo de combo na tabela typing_results: max_combo (integer >= 0)
-- ranking_score retornado = max_combo para compatibilidade com o front-end.

create or replace view public.online_typing_ranking_best_combo
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
    tr.max_combo::numeric as ranking_score,
    tr.valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    row_number() over (
      partition by tr.user_id
      order by
        tr.max_combo desc,
        tr.accuracy desc,
        tr.ppm desc,
        tr.duration_seconds desc,
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
    and tr.ppm >= 20
    and tr.correct_chars >= 50
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

grant select on public.online_typing_ranking_best_combo to anon;
grant select on public.online_typing_ranking_best_combo to authenticated;

comment on view public.online_typing_ranking_best_combo is
  'Ranking Online de Combo com apenas o melhor resultado por usuario, priorizando max_combo e usando precisao/PPM como desempate. Exige ppm >= 20 e correct_chars >= 50 para excluir sessoes muito curtas.';

-- Verificacao rapida apos aplicar:
-- select * from public.online_typing_ranking_best_combo limit 10;
-- Cada user_id deve aparecer no maximo uma vez e os resultados devem estar
-- ordenados pelo maior max_combo (campo ranking_score na view).
