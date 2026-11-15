-- Starry Dreamland: private, account-owned exploration journal.
-- Apply after the existing profile/avatar migrations.

create table if not exists private.sd_park_discoveries (
  user_id uuid not null references auth.users(id) on delete cascade,
  discovery_id text not null,
  discovered_at timestamptz not null default now(),
  primary key (user_id, discovery_id)
);

create index if not exists sd_park_discoveries_user_time_idx
  on private.sd_park_discoveries (user_id, discovered_at desc);

alter table private.sd_park_discoveries enable row level security;
revoke all on table private.sd_park_discoveries from public, anon, authenticated;

-- Defense in depth: direct client table access is denied even to signed-in users.
drop policy if exists "No direct access to park discoveries" on private.sd_park_discoveries;
create policy "No direct access to park discoveries"
on private.sd_park_discoveries
for all
to authenticated
using (false)
with check (false);

create or replace function private.sd_park_discovery_claim(p_discovery_id text)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user uuid := (select auth.uid());
  v_discovered_at timestamptz;
  v_inserted integer := 0;
  v_total integer := 0;
begin
  if v_user is null then
    raise exception using errcode='42501', message='Authentication required';
  end if;

  if p_discovery_id is null or p_discovery_id not in (
    'entrance_gate',
    'stardream_ticket_booth',
    'astral_plaza',
    'star_dream_castle',
    'starlight_carnival',
    'moonlight_teacups',
    'galaxy_drop_tower',
    'galaxy_ferris_wheel',
    'stargazer_observatory',
    'cosmic_coaster',
    'neon_shooting_gallery',
    'phantom_mirror_house'
  ) then
    raise exception using errcode='22023', message='Unknown park discovery';
  end if;

  insert into private.sd_park_discoveries (user_id, discovery_id)
  values (v_user, p_discovery_id)
  on conflict (user_id, discovery_id) do nothing
  returning discovered_at into v_discovered_at;

  get diagnostics v_inserted = row_count;

  if v_discovered_at is null then
    select d.discovered_at into v_discovered_at
    from private.sd_park_discoveries as d
    where d.user_id = v_user and d.discovery_id = p_discovery_id;
  end if;

  select count(*)::integer into v_total
  from private.sd_park_discoveries as d
  where d.user_id = v_user;

  return jsonb_build_object(
    'discovery_id', p_discovery_id,
    'newly_discovered', v_inserted = 1,
    'discovered_at', v_discovered_at,
    'total_discovered', v_total
  );
end;
$function$;

create or replace function private.sd_my_park_discoveries()
returns table(discovery_id text, discovered_at timestamptz)
language sql
security definer
set search_path to ''
as $function$
  select d.discovery_id, d.discovered_at
  from private.sd_park_discoveries as d
  where d.user_id = (select auth.uid())
  order by d.discovered_at asc;
$function$;

revoke all on function private.sd_park_discovery_claim(text) from public, anon, authenticated;
revoke all on function private.sd_my_park_discoveries() from public, anon, authenticated;
grant execute on function private.sd_park_discovery_claim(text) to authenticated;
grant execute on function private.sd_my_park_discoveries() to authenticated;

create or replace function public.sd_park_discovery_claim(p_discovery_id text)
returns jsonb
language sql
security invoker
set search_path to ''
as $function$
  select private.sd_park_discovery_claim(p_discovery_id);
$function$;

create or replace function public.sd_my_park_discoveries()
returns table(discovery_id text, discovered_at timestamptz)
language sql
security invoker
set search_path to ''
as $function$
  select * from private.sd_my_park_discoveries();
$function$;

revoke all on function public.sd_park_discovery_claim(text) from public, anon;
revoke all on function public.sd_my_park_discoveries() from public, anon;
grant execute on function public.sd_park_discovery_claim(text) to authenticated;
grant execute on function public.sd_my_park_discoveries() to authenticated;
