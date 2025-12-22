-- Ideathon submissions (Round 1)

do $$
begin
  if not exists (select 1 from pg_type where typname = 'track_type') then
    create type public.track_type as enum ('regular', 'open_innovation');
  end if;
end $$;

create table if not exists public.ideathon_submissions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  domain_id bigint references public.domains(id),
  problem_statement_id bigint references public.problem_statements(id),
  track_type public.track_type not null,
  title text not null,
  abstract text not null,
  drive_pdf_url text not null,
  submitted_at timestamptz,
  is_final boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ideathon_submissions_team_id_unique
  on public.ideathon_submissions(team_id);

create index if not exists ideathon_submissions_team_id_idx
  on public.ideathon_submissions(team_id);

alter table public.ideathon_submissions
  drop constraint if exists ideathon_drive_url_check;

alter table public.ideathon_submissions
  add constraint ideathon_drive_url_check
  check (drive_pdf_url ~* '^https?://');

create or replace function public.set_ideathon_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.domain_id is null then
    select t.domain_id into new.domain_id
    from public.teams t
    where t.id = new.team_id;
  end if;

  if new.is_final and new.submitted_at is null then
    new.submitted_at := now();
  end if;

  return new;
end;
$$;

create or replace function public.lock_ideathon_updates()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.is_final then
    raise exception 'Final submission is locked';
  end if;

  if new.is_final and new.submitted_at is null then
    new.submitted_at := now();
  end if;

  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists ideathon_set_defaults on public.ideathon_submissions;
create trigger ideathon_set_defaults
  before insert on public.ideathon_submissions
  for each row
  execute function public.set_ideathon_defaults();

drop trigger if exists ideathon_lock_updates on public.ideathon_submissions;
create trigger ideathon_lock_updates
  before update on public.ideathon_submissions
  for each row
  execute function public.lock_ideathon_updates();

alter table public.ideathon_submissions enable row level security;

drop policy if exists ideathon_select_team on public.ideathon_submissions;
create policy ideathon_select_team
  on public.ideathon_submissions
  for select
  using (
    public.is_team_member(team_id) or public.is_team_leader(team_id)
  );

drop policy if exists ideathon_insert_leader on public.ideathon_submissions;
create policy ideathon_insert_leader
  on public.ideathon_submissions
  for insert
  with check (public.is_team_leader(team_id));

drop policy if exists ideathon_update_leader on public.ideathon_submissions;
create policy ideathon_update_leader
  on public.ideathon_submissions
  for update
  using (public.is_team_leader(team_id) and is_final = false)
  with check (public.is_team_leader(team_id));

-- No delete policy: deletions are blocked by default with RLS enabled.
