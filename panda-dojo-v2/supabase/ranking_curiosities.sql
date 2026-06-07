-- Ranking Online de Curiosidades - PandaDigitacoes V2
--
-- Execute depois de ranking_eligibility.sql e ranking_views.sql.
-- Este mural nao e competitivo classico: ele destaca "Mais erros" e
-- "Maior caos" sem aceitar sessoes claramente abusivas.

grant select on public.profiles to anon;
grant select on public.profiles to authenticated;
grant select on public.typing_results to anon;
grant select on public.typing_results to authenticated;

drop policy if exists "Public can read curiosity ranking profiles" on public.profiles;
create policy "Public can read curiosity ranking profiles"
on public.profiles
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.typing_results tr
    where tr.user_id = profiles.id
      and tr.user_id is not null
      and tr.duration_seconds >= 15
      and tr.ppm is not null
      and tr.cpm is not null
      and tr.accuracy is not null
      and tr.errors is not null
      and tr.accuracy between 0 and 100
      and tr.errors > 0
      and greatest(
        coalesce(tr.raw_key_count, 0),
        coalesce(tr.correct_chars, 0) + coalesce(tr.wrong_chars, 0)
      ) >= 50
      and coalesce(tr.ranking_invalid_reason, 'low_accuracy') not in (
        'suspicious_repetition',
        'invalid_input_pattern',
        'missing_required_data'
      )
  )
);

drop policy if exists "Public can read curiosity ranking results" on public.typing_results;
create policy "Public can read curiosity ranking results"
on public.typing_results
for select
to anon, authenticated
using (
  user_id is not null
  and duration_seconds >= 15
  and ppm is not null
  and cpm is not null
  and accuracy is not null
  and errors is not null
  and accuracy between 0 and 100
  and errors > 0
  and greatest(
    coalesce(raw_key_count, 0),
    coalesce(correct_chars, 0) + coalesce(wrong_chars, 0)
  ) >= 50
  and coalesce(ranking_invalid_reason, 'low_accuracy') not in (
    'suspicious_repetition',
    'invalid_input_pattern',
    'missing_required_data'
  )
);

create or replace view public.online_curiosity_ranking_most_errors
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
    tr.errors::numeric as ranking_score,
    true::boolean as valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    'most_errors'::text as curiosity_type,
    row_number() over (
      partition by tr.user_id
      order by tr.errors desc, tr.duration_seconds desc, tr.completed_at asc
    ) as rn
  from public.typing_results tr
  join public.profiles p on p.id = tr.user_id
  where tr.user_id is not null
    and tr.duration_seconds >= 15
    and tr.ppm is not null
    and tr.cpm is not null
    and tr.accuracy is not null
    and tr.errors is not null
    and tr.accuracy between 0 and 100
    and tr.errors > 0
    and greatest(
      coalesce(tr.raw_key_count, 0),
      coalesce(tr.correct_chars, 0) + coalesce(tr.wrong_chars, 0)
    ) >= 50
    and coalesce(tr.ranking_invalid_reason, 'low_accuracy') not in (
      'suspicious_repetition',
      'invalid_input_pattern',
      'missing_required_data'
    )
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
  curiosity_type
from ranked
where rn = 1;

grant select on public.online_curiosity_ranking_most_errors to anon;
grant select on public.online_curiosity_ranking_most_errors to authenticated;

comment on view public.online_curiosity_ranking_most_errors is
  'Mural dos Distraidos: melhor resultado por usuario ordenado por maior quantidade de erros, sem sessoes abusivas.';

create or replace view public.online_curiosity_ranking_chaos
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
    ((tr.errors::numeric * 2) + greatest(0::numeric, 100 - tr.accuracy)) as ranking_score,
    true::boolean as valid_for_ranking,
    tr.completed_at,
    tr.completed_at as created_at,
    'chaos'::text as curiosity_type,
    row_number() over (
      partition by tr.user_id
      order by
        ((tr.errors::numeric * 2) + greatest(0::numeric, 100 - tr.accuracy)) desc,
        tr.errors desc,
        tr.completed_at asc
    ) as rn
  from public.typing_results tr
  join public.profiles p on p.id = tr.user_id
  where tr.user_id is not null
    and tr.duration_seconds >= 15
    and tr.ppm is not null
    and tr.cpm is not null
    and tr.accuracy is not null
    and tr.errors is not null
    and tr.accuracy between 0 and 100
    and tr.errors > 0
    and greatest(
      coalesce(tr.raw_key_count, 0),
      coalesce(tr.correct_chars, 0) + coalesce(tr.wrong_chars, 0)
    ) >= 50
    and coalesce(tr.ranking_invalid_reason, 'low_accuracy') not in (
      'suspicious_repetition',
      'invalid_input_pattern',
      'missing_required_data'
    )
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
  curiosity_type
from ranked
where rn = 1;

grant select on public.online_curiosity_ranking_chaos to anon;
grant select on public.online_curiosity_ranking_chaos to authenticated;

create index if not exists typing_results_curiosity_ranking_idx
on public.typing_results (
  user_id,
  errors desc,
  duration_seconds desc,
  completed_at asc
)
where user_id is not null
  and duration_seconds >= 15
  and errors > 0;

comment on view public.online_curiosity_ranking_chaos is
  'Mural dos Distraidos: melhor resultado por usuario por caos = errors * 2 + max(0, 100 - accuracy), sem sessoes abusivas.';
