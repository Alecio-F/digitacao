with profile_candidates as (
  select
    p.id,
    p.username,
    p.display_name,
    coalesce(
      nullif(u.raw_user_meta_data->>'display_name', ''),
      nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
      nullif(p.username, ''),
      'Aprendiz do Dojo'
    ) as next_display_name,
    coalesce(
      nullif(lower(regexp_replace(
        split_part(coalesce(u.email, ''), '@', 1),
        '[^a-zA-Z0-9_]',
        '',
        'g'
      )), ''),
      'panda_' || substring(replace(p.id::text, '-', ''), 1, 8)
    ) as base_username
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.display_name is null
     or p.display_name = ''
     or p.username is null
     or p.username = ''
),
resolved as (
  select
    c.id,
    c.next_display_name,
    case
      when count(*) over (partition by c.base_username) > 1
      then left(c.base_username, 22) || '_' || substring(replace(c.id::text, '-', ''), 1, 8)
      when exists (
        select 1
        from public.profiles other
        where other.username = c.base_username
          and other.id <> c.id
      )
      then left(c.base_username, 22) || '_' || substring(replace(c.id::text, '-', ''), 1, 8)
      else c.base_username
    end as next_username
  from profile_candidates c
)
update public.profiles p
set
  display_name = coalesce(nullif(p.display_name, ''), r.next_display_name, 'Aprendiz do Dojo'),
  username = coalesce(nullif(p.username, ''), r.next_username, 'panda_' || substring(replace(p.id::text, '-', ''), 1, 8))
from resolved r
where p.id = r.id
  and (
    p.display_name is null
    or p.display_name = ''
    or p.username is null
    or p.username = ''
  );
