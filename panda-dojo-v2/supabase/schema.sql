create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  avatar_url text,
  level integer not null default 1 check (level >= 1),
  xp integer not null default 0 check (xp >= 0),
  title text not null default 'Filhote de Panda',
  daily_streak integer not null default 0 check (daily_streak >= 0),
  last_training_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create table if not exists public.typing_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mode text not null,
  lesson_id text,
  practice_text_id text,
  daily_challenge_id text,
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  ppm integer not null default 0 check (ppm >= 0),
  cpm integer not null default 0 check (cpm >= 0),
  accuracy numeric(5,2) not null default 0 check (accuracy >= 0 and accuracy <= 100),
  errors integer not null default 0 check (errors >= 0),
  max_combo integer not null default 0 check (max_combo >= 0),
  mistake_keys jsonb not null default '{}'::jsonb,
  correct_chars integer not null default 0 check (correct_chars >= 0),
  wrong_chars integer not null default 0 check (wrong_chars >= 0),
  raw_key_count integer not null default 0 check (raw_key_count >= 0),
  repeated_key_count integer not null default 0 check (repeated_key_count >= 0),
  valid_for_ranking boolean not null default false,
  ranking_score numeric not null default 0,
  suspicious_flags jsonb not null default '{}'::jsonb,
  ranking_invalid_reasons jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create index if not exists typing_results_user_completed_idx
on public.typing_results (user_id, completed_at desc);

create index if not exists typing_results_ranking_idx
on public.typing_results (valid_for_ranking, ranking_score desc, ppm desc, accuracy desc);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  status text not null default 'started',
  best_accuracy numeric(5,2) not null default 0 check (best_accuracy >= 0 and best_accuracy <= 100),
  best_ppm integer not null default 0 check (best_ppm >= 0),
  medal text not null default 'none',
  attempts integer not null default 0 check (attempts >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

create table if not exists public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text,
  xp_reward integer not null default 0 check (xp_reward >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(user_id, achievement_id)
);

create table if not exists public.arcade_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  game_id text not null,
  score integer not null default 0 check (score >= 0),
  max_combo integer not null default 0 check (max_combo >= 0),
  level_reached integer not null default 1 check (level_reached >= 1),
  played_at timestamptz not null default now()
);

create index if not exists arcade_scores_user_game_idx
on public.arcade_scores (user_id, game_id, score desc);

create table if not exists public.daily_challenge_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  challenge_date date not null,
  challenge_id text not null,
  ppm integer not null default 0 check (ppm >= 0),
  cpm integer not null default 0 check (cpm >= 0),
  accuracy numeric(5,2) not null default 0 check (accuracy >= 0 and accuracy <= 100),
  errors integer not null default 0 check (errors >= 0),
  max_combo integer not null default 0 check (max_combo >= 0),
  duration_seconds integer not null default 0 check (duration_seconds >= 0),
  share_text text,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_date)
);

create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme text default 'dark',
  arena_cursor text default 'arcade',
  virtual_keyboard_enabled boolean default true,
  sounds_enabled boolean default true,
  animations_enabled boolean default true,
  default_practice_time integer default 30,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_user_settings_updated_at on public.user_settings;
create trigger set_user_settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  resolved_username text;
  resolved_display_name text;
begin
  resolved_display_name := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Aprendiz do Dojo'
  );

  base_username := lower(regexp_replace(
    split_part(coalesce(new.email, ''), '@', 1),
    '[^a-zA-Z0-9_]',
    '',
    'g'
  ));
  resolved_username := coalesce(
    nullif(base_username, ''),
    'panda_' || substring(replace(new.id::text, '-', ''), 1, 8)
  );

  if exists (
    select 1 from public.profiles where username = resolved_username
  ) then
    resolved_username := left(resolved_username, 22) || '_' || substring(replace(new.id::text, '-', ''), 1, 8);
  end if;

  insert into public.profiles (id, display_name, username)
  values (
    new.id,
    resolved_display_name,
    resolved_username
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.typing_results enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.arcade_scores enable row level security;
alter table public.daily_challenge_results enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can read own typing results" on public.typing_results;
create policy "Users can read own typing results"
on public.typing_results
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own typing results" on public.typing_results;
create policy "Users can insert own typing results"
on public.typing_results
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can delete own typing results" on public.typing_results;
create policy "Users can delete own typing results"
on public.typing_results
for delete
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can read own lesson progress" on public.lesson_progress;
create policy "Users can read own lesson progress"
on public.lesson_progress
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own lesson progress" on public.lesson_progress;
create policy "Users can insert own lesson progress"
on public.lesson_progress
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own lesson progress" on public.lesson_progress;
create policy "Users can update own lesson progress"
on public.lesson_progress
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Authenticated users can read achievements" on public.achievements;
create policy "Authenticated users can read achievements"
on public.achievements
for select
to authenticated
using (true);

drop policy if exists "Users can read own achievements" on public.user_achievements;
create policy "Users can read own achievements"
on public.user_achievements
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own achievements" on public.user_achievements;
create policy "Users can insert own achievements"
on public.user_achievements
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read own arcade scores" on public.arcade_scores;
create policy "Users can read own arcade scores"
on public.arcade_scores
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own arcade scores" on public.arcade_scores;
create policy "Users can insert own arcade scores"
on public.arcade_scores
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can read own daily challenge results" on public.daily_challenge_results;
create policy "Users can read own daily challenge results"
on public.daily_challenge_results
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own daily challenge results" on public.daily_challenge_results;
create policy "Users can insert own daily challenge results"
on public.daily_challenge_results
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own daily challenge results" on public.daily_challenge_results;
create policy "Users can update own daily challenge results"
on public.daily_challenge_results
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can read own settings" on public.user_settings;
create policy "Users can read own settings"
on public.user_settings
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can insert own settings" on public.user_settings;
create policy "Users can insert own settings"
on public.user_settings
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own settings" on public.user_settings;
create policy "Users can update own settings"
on public.user_settings
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
