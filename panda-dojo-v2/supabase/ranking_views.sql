-- Ranking Online Inicial - PandaDigitacoes V2
--
-- Execute este arquivo depois de supabase/schema.sql.
-- As views expoem somente campos necessarios para o mural online e mantem
-- dados sensiveis fora do front-end.

create or replace view public.online_typing_ranking
with (security_invoker = true)
as
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

-- Policies necessarias para views com security_invoker.
--
-- Sem estas policies, o RLS de public.typing_results e public.profiles permite
-- que cada usuario veja apenas os proprios dados. Isso faz o Ranking Online
-- mostrar somente a conta logada, mesmo quando existem resultados de outros
-- usuarios no banco.

grant select on public.profiles to anon;
grant select on public.profiles to authenticated;
grant select on public.typing_results to anon;
grant select on public.typing_results to authenticated;

drop policy if exists "Public can read ranking profiles" on public.profiles;
create policy "Public can read ranking profiles"
on public.profiles
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.typing_results tr
    where tr.user_id = profiles.id
      and tr.valid_for_ranking = true
      and tr.user_id is not null
      and tr.ppm is not null
      and tr.accuracy is not null
      and tr.accuracy >= 90
      and tr.duration_seconds >= 15
  )
);

drop policy if exists "Public can read eligible ranking results" on public.typing_results;
create policy "Public can read eligible ranking results"
on public.typing_results
for select
to anon, authenticated
using (
  valid_for_ranking = true
  and user_id is not null
  and ppm is not null
  and accuracy is not null
  and accuracy >= 90
  and duration_seconds >= 15
);

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

-- Ranking Online de Velocidade - melhor resultado por usuario focado em PPM.

create or replace view public.online_typing_ranking_best_speed
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
    tr.ppm::numeric as ranking_score,
    tr.valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    row_number() over (
      partition by tr.user_id
      order by
        tr.ppm desc,
        tr.accuracy desc,
        tr.cpm desc,
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

grant select on public.online_typing_ranking_best_speed to anon;
grant select on public.online_typing_ranking_best_speed to authenticated;

comment on view public.online_typing_ranking_best_speed is
  'Ranking Online de Velocidade com apenas o melhor resultado por usuario, priorizando PPM e usando precisao/CPM como desempate.';

-- Ranking Online de Precisao - melhor resultado por usuario focado em accuracy.

create or replace view public.online_typing_ranking_best_accuracy
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
    tr.accuracy as ranking_score,
    tr.valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    row_number() over (
      partition by tr.user_id
      order by
        tr.accuracy desc,
        tr.ppm desc,
        tr.cpm desc,
        tr.errors asc,
        tr.completed_at asc
    ) as rn
  from public.typing_results tr
  join public.profiles p on p.id = tr.user_id
  where tr.valid_for_ranking = true
    and tr.user_id is not null
    and tr.ppm is not null
    and tr.accuracy is not null
    and tr.accuracy >= 95
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

grant select on public.online_typing_ranking_best_accuracy to anon;
grant select on public.online_typing_ranking_best_accuracy to authenticated;

comment on view public.online_typing_ranking_best_accuracy is
  'Ranking Online de Precisao com apenas o melhor resultado por usuario, priorizando accuracy e usando PPM/CPM/erros como desempate.';

-- Ranking Online de Combo - melhor resultado por usuario focado em max_combo.

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
