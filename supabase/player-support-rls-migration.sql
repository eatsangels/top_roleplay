-- Allows authenticated players to create and read their own support tickets/reports.
-- Apply after supabase/top-roleplay-schema.sql on projects that already have reports and tickets.

create or replace function public.current_player_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.players where profile_id = auth.uid() limit 1;
$$;

drop policy if exists "Players read own reports" on public.reports;
drop policy if exists "Players create own reports" on public.reports;
drop policy if exists "Players read own tickets" on public.tickets;
drop policy if exists "Players create own tickets" on public.tickets;

create policy "Players read own reports" on public.reports
  for select
  using (reporter_player_id = public.current_player_id());

create policy "Players create own reports" on public.reports
  for insert
  with check (
    reporter_player_id = public.current_player_id()
    and reported_player_id is not null
    and reported_player_id <> public.current_player_id()
  );

create policy "Players read own tickets" on public.tickets
  for select
  using (player_id = public.current_player_id());

create policy "Players create own tickets" on public.tickets
  for insert
  with check (player_id = public.current_player_id());

notify pgrst, 'reload schema';
