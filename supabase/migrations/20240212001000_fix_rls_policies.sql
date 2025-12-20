-- Fix RLS recursion with security definer helpers

create or replace function public.is_team_member(team_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.team_members tm
    where tm.team_id = team_uuid
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.is_team_leader(team_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
set row_security = off
as $$
  select exists (
    select 1 from public.teams t
    where t.id = team_uuid
      and t.leader_user_id = auth.uid()
  );
$$;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'teams' loop
    execute format('drop policy if exists %I on public.teams', pol.policyname);
  end loop;
end $$;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'team_members' loop
    execute format('drop policy if exists %I on public.team_members', pol.policyname);
  end loop;
end $$;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'users' loop
    execute format('drop policy if exists %I on public.users', pol.policyname);
  end loop;
end $$;

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname = 'public' and tablename = 'team_invites' loop
    execute format('drop policy if exists %I on public.team_invites', pol.policyname);
  end loop;
end $$;

create policy teams_select_members on public.teams
  for select using (
    public.is_team_member(teams.id) or public.is_team_leader(teams.id)
  );

create policy teams_insert_leader on public.teams
  for insert with check (auth.uid() = leader_user_id);

create policy teams_update_leader on public.teams
  for update using (auth.uid() = leader_user_id);

create policy team_members_select_team on public.team_members
  for select using (
    auth.uid() = user_id or public.is_team_leader(team_members.team_id)
  );

create policy team_members_insert_block on public.team_members
  for insert with check (false);

create policy team_members_update_block on public.team_members
  for update using (false);

create policy team_members_delete_leader on public.team_members
  for delete using (public.is_team_leader(team_members.team_id));

create policy users_select_self on public.users
  for select using (auth.uid() = id);

create policy users_select_leader_team on public.users
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.user_id = users.id
        and public.is_team_leader(tm.team_id)
    )
  );

create policy users_insert_self on public.users
  for insert with check (auth.uid() = id);

create policy users_update_self on public.users
  for update using (auth.uid() = id);

create policy team_invites_select_leader on public.team_invites
  for select using (public.is_team_leader(team_invites.team_id));

create policy team_invites_insert_block on public.team_invites
  for insert with check (false);

create policy team_invites_update_block on public.team_invites
  for update using (false);

create policy team_invites_delete_block on public.team_invites
  for delete using (false);
