-- Public CMS content for existing TOP ROLEPLAY projects.
-- Idempotent: safe to apply more than once.

create index if not exists news_public_published_idx
  on public.news (published_at desc)
  where status = 'publicado';

create index if not exists events_public_schedule_idx
  on public.events (is_featured desc, starts_at asc)
  where status in ('activo', 'destacado');

drop policy if exists "Public reads published news" on public.news;
create policy "Public reads published news" on public.news
  for select
  using (status = 'publicado' and published_at is not null and published_at <= now());

drop policy if exists "Public reads active events" on public.events;
create policy "Public reads active events" on public.events
  for select
  using (
    status in ('activo', 'destacado')
    and (ends_at is null or ends_at >= now())
  );

drop policy if exists "Public reads public settings" on public.site_settings;
create policy "Public reads public settings" on public.site_settings
  for select
  using (key in ('public_config', 'public_metrics', 'public_content'));

insert into public.site_settings (key, value)
values
  (
    'public_config',
    '{
      "heroEyebrow": "La experiencia oficial TOP ROLEPLAY",
      "heroTagline": "Donde tú eres el protagonista y cada decisión construye roleplay.",
      "heroDescription": "Entra a TOP ROLEPLAY, crea una identidad inolvidable y vive historias con una comunidad donde reputación, alianzas y consecuencias importan.",
      "discordUrl": "https://discord.com",
      "serverStatus": "TOP ROLEPLAY online"
    }'::jsonb
  ),
  (
    'public_metrics',
    '[
      {"label": "Leyendas TOP registradas", "value": "18.420", "icon": "users"},
      {"label": "Jugadores TOP online", "value": "327", "icon": "online"},
      {"label": "Clanes TOP activos", "value": "64", "icon": "guilds"},
      {"label": "Eventos TOP semanales", "value": "12", "icon": "events"},
      {"label": "Años creando roleplay", "value": "7", "icon": "history"}
    ]'::jsonb
  )
on conflict (key) do nothing;
