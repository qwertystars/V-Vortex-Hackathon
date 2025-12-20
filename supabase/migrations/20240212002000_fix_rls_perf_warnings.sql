-- Fix auth RLS init plan warnings and merge permissive policies

-- Teams policies
drop policy if exists teams_insert_leader on public.teams;
create policy teams_insert_leader on public.teams
  for insert
  with check ((select auth.uid()) = leader_user_id);

drop policy if exists teams_update_leader on public.teams;
create policy teams_update_leader on public.teams
  for update
  using ((select auth.uid()) = leader_user_id);

-- Team members policies
drop policy if exists team_members_select_team on public.team_members;
create policy team_members_select_team on public.team_members
  for select
  using (((select auth.uid()) = user_id) or is_team_leader(team_id));

-- Users policies
drop policy if exists users_insert_self on public.users;
create policy users_insert_self on public.users
  for insert
  with check ((select auth.uid()) = id);

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update
  using ((select auth.uid()) = id);

drop policy if exists users_select_self on public.users;
drop policy if exists users_select_leader_team on public.users;
create policy users_select_self_or_leader on public.users
  for select
  using (
    (select auth.uid()) = id
    or exists (
      select 1 from public.team_members tm
      where tm.user_id = users.id
        and is_team_leader(tm.team_id)
    )
  );
