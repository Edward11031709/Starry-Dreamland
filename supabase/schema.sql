-- Starry Dreamland：全球帳號與排行榜資料表
-- 在 Supabase Dashboard → SQL Editor 執行。
-- 不需要也不可以把 service_role/private key 放進 GitHub Pages。

create table if not exists public.sd_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(trim(nickname)) between 1 and 16),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sd_game_records (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null check (game_id in (
    'moon', 'cipher', 'orbit',
    'constellation', 'maze', 'child-connect', 'child-memory'
  )),
  category text not null check (category in ('adult', 'kids')),
  score integer not null check (score between 0 and 100),
  status text not null check (status in ('completed', 'timed_out', 'abandoned', 'failed')),
  reward integer not null default 0 check (reward between 0 and 15),
  created_at timestamptz not null default now(),
  constraint sd_game_category_matches check (
    (category = 'adult' and game_id in ('moon', 'cipher', 'orbit'))
    or
    (category = 'kids' and game_id in ('constellation', 'maze', 'child-connect', 'child-memory'))
  )
);

create index if not exists sd_game_records_user_created_idx
  on public.sd_game_records (user_id, created_at desc);
create index if not exists sd_game_records_game_score_idx
  on public.sd_game_records (game_id, score desc, created_at asc);

-- Explicit schema/table/sequence privileges are required by the Data API.
grant usage on schema public to authenticated;

alter table public.sd_profiles enable row level security;
alter table public.sd_game_records enable row level security;

revoke all on table public.sd_profiles from anon, authenticated;
revoke all on table public.sd_game_records from anon, authenticated;

grant select, insert, update on table public.sd_profiles to authenticated;
grant insert (user_id, game_id, category, score, status, reward)
  on table public.sd_game_records to authenticated;
grant usage, select on sequence public.sd_game_records_id_seq to authenticated;

drop policy if exists "Players read their own profile" on public.sd_profiles;
create policy "Players read their own profile"
  on public.sd_profiles for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Players create their own profile" on public.sd_profiles;
create policy "Players create their own profile"
  on public.sd_profiles for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players update their own profile" on public.sd_profiles;
create policy "Players update their own profile"
  on public.sd_profiles for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Players submit records only for themselves" on public.sd_game_records;
create policy "Players submit records only for themselves"
  on public.sd_game_records for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- Keep elevated aggregate functions out of the exposed Data API schema.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Internal aggregate functions run with database-owner privileges but verify auth.uid().
create or replace function private.sd_my_game_records()
returns table (
  record_id bigint,
  game_id text,
  category text,
  score integer,
  status text,
  reward integer,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.game_id, r.category, r.score, r.status, r.reward, r.created_at
  from public.sd_game_records as r
  where r.user_id = (select auth.uid())
    and (select auth.uid()) is not null
  order by r.created_at desc
  limit 1000;
$$;

create or replace function private.sd_global_best_scores()
returns table (
  user_id uuid,
  nickname text,
  game_id text,
  category text,
  best_score integer,
  first_achieved_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception using errcode = '42501', message = 'Authentication required';
  end if;

  return query
  with eligible as (
    select r.user_id, r.game_id, r.category, r.score, r.created_at
    from public.sd_game_records as r
    where r.status in ('completed', 'timed_out')
  ),
  bests as (
    select e.user_id, e.game_id, e.category, max(e.score)::integer as best_score
    from eligible as e
    group by e.user_id, e.game_id, e.category
  ),
  firsts as (
    select e.user_id, e.game_id, min(e.created_at) as first_achieved_at
    from eligible as e
    join bests as b
      on b.user_id = e.user_id
     and b.game_id = e.game_id
     and b.category = e.category
     and b.best_score = e.score
    group by e.user_id, e.game_id
  )
  select p.user_id, p.nickname, b.game_id, b.category, b.best_score, f.first_achieved_at
  from bests as b
  join firsts as f
    on f.user_id = b.user_id and f.game_id = b.game_id
  join public.sd_profiles as p
    on p.user_id = b.user_id;
end;
$$;

revoke all on function private.sd_my_game_records() from public, anon;
revoke all on function private.sd_global_best_scores() from public, anon;
grant execute on function private.sd_my_game_records() to authenticated;
grant execute on function private.sd_global_best_scores() to authenticated;

-- Public RPC wrappers are invoker functions; the internal privileged functions enforce auth.uid().
create or replace function public.sd_my_game_records()
returns table (
  record_id bigint,
  game_id text,
  category text,
  score integer,
  status text,
  reward integer,
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.sd_my_game_records();
$$;

create or replace function public.sd_global_best_scores()
returns table (
  user_id uuid,
  nickname text,
  game_id text,
  category text,
  best_score integer,
  first_achieved_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.sd_global_best_scores();
$$;

revoke all on function public.sd_my_game_records() from public, anon;
revoke all on function public.sd_global_best_scores() from public, anon;
grant execute on function public.sd_my_game_records() to authenticated;
grant execute on function public.sd_global_best_scores() to authenticated;
