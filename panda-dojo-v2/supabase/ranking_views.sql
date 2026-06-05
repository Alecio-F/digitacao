-- Ranking Online Inicial — PandaDigitações V2
--
-- Execute este arquivo depois de supabase/schema.sql.
-- A view expõe somente campos necessários para o mural online e mantém dados
-- sensíveis fora do front-end.

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
  'Mural online público com resultados elegíveis da Type Arena e campos mínimos de perfil.';
