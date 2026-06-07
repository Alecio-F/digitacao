-- Ranking Online do Arcade -- PandaDigitacoes V2
--
-- Execute este arquivo no Supabase SQL Editor para ativar o Ranking Online do Arcade.
--
-- Requer que supabase/schema.sql ja tenha sido aplicado.
-- A tabela public.arcade_scores ja existe com (user_id, game_id, score, max_combo, level_reached, played_at).
-- Este arquivo adiciona grants publicos, policy de leitura para ranking e cria a view de ranking.

-- ===========================================================================
-- PARTE 1: Grants e policy publica de leitura para ranking
--
-- O schema.sql ja tem policies para o usuario ler/inserir os proprios scores.
-- Aqui adicionamos leitura publica de scores elegiveis (score > 0) para que a
-- view com security_invoker = true funcione para anon e authenticated.
-- Padrao identico ao adotado em daily_challenge_ranking.sql e ranking_views.sql.
-- ===========================================================================

grant select on public.arcade_scores to anon;
grant select on public.arcade_scores to authenticated;

drop policy if exists "Public can read arcade scores for ranking" on public.arcade_scores;
create policy "Public can read arcade scores for ranking"
on public.arcade_scores
for select
to anon, authenticated
using (
  user_id is not null
  and score > 0
);

-- ===========================================================================
-- PARTE 2: View de Ranking Online do Arcade
--
-- Usa row_number() PARTITION BY (user_id, game_id) para manter o melhor score
-- de cada usuario por jogo. Um mesmo usuario pode aparecer uma vez por jogo
-- (ex: uma vez em panda-keys e uma vez em seal-challenge).
--
-- Compatibilidade com RemoteRankingEntry:
--   - mode       = 'arcade'
--   - practice_text_id = game_id  (transporta o identificador do jogo)
--   - lesson_id, daily_challenge_id = null
--   - ppm, cpm, accuracy, errors, duration_seconds = 0 (arcade nao usa esses campos)
--   - ranking_score = score  (compatibilidade com o sistema de score do front-end)
--   - valid_for_ranking = true (todos os scores > 0 sao elegíveis)
--   - completed_at = played_at
-- ===========================================================================

create or replace view public.online_arcade_ranking_best
with (security_invoker = true)
as
with ranked as (
  select
    ar.id,
    ar.user_id,
    coalesce(nullif(p.username, ''), 'panda_user') as username,
    coalesce(nullif(p.display_name, ''), nullif(p.username, ''), 'Aprendiz do Dojo') as display_name,
    p.avatar_url,
    coalesce(nullif(p.title, ''), 'Filhote de Panda') as title,
    'arcade'::text as mode,
    null::text as lesson_id,
    ar.game_id as practice_text_id,
    null::text as daily_challenge_id,
    0::numeric as ppm,
    0::numeric as cpm,
    0::numeric as accuracy,
    0 as errors,
    ar.max_combo,
    0::numeric as duration_seconds,
    ar.score::numeric as ranking_score,
    true as valid_for_ranking,
    ar.played_at as completed_at,
    ar.played_at as created_at,
    ar.level_reached,
    row_number() over (
      partition by ar.user_id, ar.game_id
      order by
        ar.score desc,
        ar.max_combo desc,
        ar.level_reached desc,
        ar.played_at asc
    ) as rn
  from public.arcade_scores ar
  join public.profiles p on p.id = ar.user_id
  where ar.user_id is not null
    and ar.score > 0
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
  created_at,
  level_reached
from ranked
where rn = 1;

grant select on public.online_arcade_ranking_best to anon;
grant select on public.online_arcade_ranking_best to authenticated;

comment on view public.online_arcade_ranking_best is
  'Ranking do Arcade com o melhor score por usuario por jogo (partition by user_id, game_id). Apenas scores > 0.';

-- ===========================================================================
-- Verificacao rapida apos aplicar:
--
-- select game_id, count(*) as entradas, count(distinct user_id) as jogadores
-- from public.online_arcade_ranking_best
-- group by game_id
-- order by game_id;
--
-- Cada user_id deve aparecer no maximo uma vez por game_id.
-- select * from public.online_arcade_ranking_best
-- order by ranking_score desc
-- limit 20;
-- ===========================================================================
