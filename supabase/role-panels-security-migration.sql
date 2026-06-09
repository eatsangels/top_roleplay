-- Apply this once to an existing TOP ROLEPLAY Supabase project.

drop policy if exists "Admins can read admin data" on public.admin_roles;
drop policy if exists "Staff read own role" on public.admin_roles;
create policy "Staff read own role" on public.admin_roles for select
  using (user_id = auth.uid() or public.current_admin_role() = 'super_admin');

drop policy if exists "Staff manages notes" on public.staff_notes;
drop policy if exists "Moderators manage staff notes" on public.staff_notes;
create policy "Moderators manage staff notes" on public.staff_notes for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'moderator'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));

drop policy if exists "Admins read logs" on public.admin_logs;
drop policy if exists "Admins insert logs" on public.admin_logs;
drop policy if exists "Staff read permitted logs" on public.admin_logs;
drop policy if exists "Staff insert own logs" on public.admin_logs;
create policy "Staff read permitted logs" on public.admin_logs for select
  using (admin_user_id = auth.uid() or public.current_admin_role() = 'super_admin');
create policy "Staff insert own logs" on public.admin_logs for insert
  with check (public.is_admin() and admin_user_id = auth.uid());

-- Existing projects may not have received the sanctions table from the full schema.
create table if not exists public.sanctions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  issued_by uuid references public.profiles(id) on delete set null,
  sanction_type text not null,
  reason text not null,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sanctions_player_created_idx
  on public.sanctions(player_id, created_at desc);

alter table public.sanctions enable row level security;
drop policy if exists "Moderators manage sanctions" on public.sanctions;
create policy "Moderators manage sanctions" on public.sanctions
  for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'moderator'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));

notify pgrst, 'reload schema';
