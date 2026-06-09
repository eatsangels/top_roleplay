-- Adds the sanctions module to an existing TOP ROLEPLAY Supabase project.
-- Idempotent: safe to apply more than once.

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

-- Ask PostgREST to refresh its schema cache immediately.
notify pgrst, 'reload schema';
