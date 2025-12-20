-- Auth foundation schema updates

alter table public.teams
  add column if not exists leader_user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'teams_leader_user_id_fkey'
  ) then
    alter table public.teams
      add constraint teams_leader_user_id_fkey
      foreign key (leader_user_id) references auth.users(id);
  end if;
end $$;

create unique index if not exists teams_leader_user_id_unique
  on public.teams(leader_user_id);

alter table public.users
  add column if not exists onboarding_complete boolean not null default false;

do $$
begin
  if exists (
    select 1 from pg_constraint where conname = 'team_members_user_id_fkey'
  ) then
    alter table public.team_members
      drop constraint team_members_user_id_fkey;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'team_members_user_id_fkey'
  ) then
    alter table public.team_members
      add constraint team_members_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;

create unique index if not exists team_members_user_id_unique
  on public.team_members(user_id);

create table if not exists public.team_invites (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  invited_by uuid references auth.users(id),
  invited_user_id uuid references auth.users(id),
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  accepted_at timestamptz
);

create unique index if not exists team_invites_unique
  on public.team_invites(team_id, email);

-- RLS hardening
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.users enable row level security;
alter table public.team_invites enable row level security;

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
    exists (
      select 1 from public.team_members tm
      where tm.team_id = teams.id
        and tm.user_id = auth.uid()
    )
    or auth.uid() = teams.leader_user_id
  );

create policy teams_insert_leader on public.teams
  for insert with check (auth.uid() = leader_user_id);

create policy teams_update_leader on public.teams
  for update using (auth.uid() = leader_user_id);

create policy team_members_select_team on public.team_members
  for select using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_members.team_id
        and tm.user_id = auth.uid()
    )
  );

create policy team_members_insert_block on public.team_members
  for insert with check (false);

create policy team_members_update_block on public.team_members
  for update using (false);

create policy team_members_delete_leader on public.team_members
  for delete using (
    exists (
      select 1 from public.teams t
      where t.id = team_members.team_id
        and t.leader_user_id = auth.uid()
    )
  );

create policy users_select_self on public.users
  for select using (auth.uid() = id);

create policy users_select_leader_team on public.users
  for select using (
    exists (
      select 1 from public.teams t
      join public.team_members tm on tm.team_id = t.id
      where t.leader_user_id = auth.uid()
        and tm.user_id = users.id
    )
  );

create policy users_insert_self on public.users
  for insert with check (auth.uid() = id);

create policy users_update_self on public.users
  for update using (auth.uid() = id);

create policy team_invites_select_leader on public.team_invites
  for select using (
    exists (
      select 1 from public.teams t
      where t.id = team_invites.team_id
        and t.leader_user_id = auth.uid()
    )
  );

create policy team_invites_insert_block on public.team_invites
  for insert with check (false);

create policy team_invites_update_block on public.team_invites
  for update using (false);

create policy team_invites_delete_block on public.team_invites
  for delete using (false);
