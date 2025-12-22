-- QR token attendance system for Nexus Entry

do $$
begin
  if not exists (select 1 from pg_type where typname = 'checkpoint_type') then
    create type public.checkpoint_type as enum ('entry_1', 'entry_2', 'entry_3');
  end if;
end $$;

create table if not exists public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  checkpoint public.checkpoint_type not null,
  token_hash text not null unique,
  issued_by_user_id uuid not null references auth.users(id),
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id uuid references auth.users(id)
);

create index if not exists qr_tokens_team_checkpoint_idx
  on public.qr_tokens(team_id, checkpoint);

create index if not exists qr_tokens_expires_at_idx
  on public.qr_tokens(expires_at);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  checkpoint public.checkpoint_type not null,
  checked_in_at timestamptz not null default now(),
  checked_in_by_user_id uuid references auth.users(id),
  source_token_id uuid references public.qr_tokens(id)
);

create unique index if not exists attendance_team_checkpoint_unique
  on public.attendance(team_id, checkpoint);

create index if not exists attendance_team_checkpoint_idx
  on public.attendance(team_id, checkpoint);

create index if not exists attendance_source_token_idx
  on public.attendance(source_token_id);

alter table public.qr_tokens enable row level security;
alter table public.attendance enable row level security;

drop policy if exists qr_tokens_select_leader on public.qr_tokens;
create policy qr_tokens_select_leader
  on public.qr_tokens
  for select
  using (public.is_team_leader(team_id));

drop policy if exists qr_tokens_insert_leader on public.qr_tokens;
create policy qr_tokens_insert_leader
  on public.qr_tokens
  for insert
  with check (
    public.is_team_leader(team_id)
    and auth.uid() = issued_by_user_id
  );

-- No update/delete policies: client updates are blocked by default.

drop policy if exists attendance_select_team on public.attendance;
create policy attendance_select_team
  on public.attendance
  for select
  using (
    public.is_team_member(team_id) or public.is_team_leader(team_id)
  );

-- No insert/update/delete policies: attendance writes are server-only.
