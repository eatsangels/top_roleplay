-- Support evidence uploads for player tickets and reports.
-- Apply after supabase/top-roleplay-schema.sql.

create or replace function public.current_player_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.players where profile_id = auth.uid() limit 1;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-attachments',
  'support-attachments',
  false,
  10485760,
  array[
    'application/pdf',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'video/mp4',
    'video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.support_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references public.tickets(id) on delete cascade,
  report_id uuid references public.reports(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  bucket text not null default 'support-attachments',
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  created_at timestamptz not null default now(),
  check ((ticket_id is not null)::int + (report_id is not null)::int = 1),
  unique (bucket, storage_path)
);

alter table public.support_attachments enable row level security;

drop policy if exists "Players read own support attachments" on public.support_attachments;
drop policy if exists "Staff manage support attachments" on public.support_attachments;

create policy "Players read own support attachments" on public.support_attachments
  for select
  using (player_id = public.current_player_id());

create policy "Staff manage support attachments" on public.support_attachments
  for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'moderator', 'support'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator', 'support'));

drop policy if exists "Staff reads support attachment objects" on storage.objects;
drop policy if exists "Players read own support attachment objects" on storage.objects;

create policy "Staff reads support attachment objects" on storage.objects
  for select
  using (
    bucket_id = 'support-attachments'
    and public.current_admin_role() in ('super_admin', 'admin', 'moderator', 'support')
  );

create policy "Players read own support attachment objects" on storage.objects
  for select
  using (
    bucket_id = 'support-attachments'
    and exists (
      select 1
      from public.support_attachments attachment
      where attachment.bucket = storage.objects.bucket_id
        and attachment.storage_path = storage.objects.name
        and attachment.player_id = public.current_player_id()
    )
  );

notify pgrst, 'reload schema';
