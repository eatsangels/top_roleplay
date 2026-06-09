-- TOP ROLEPLAY Supabase foundation.
-- Run this after creating a Supabase project, then replace demo policies with production checks as needed.

create type public.admin_role as enum ('super_admin', 'admin', 'moderator', 'editor', 'support');
create type public.content_status as enum ('borrador', 'publicado', 'archivado');
create type public.account_status as enum ('activo', 'pendiente', 'suspendido', 'baneado');
create type public.ticket_status as enum ('pendiente', 'en_revision', 'resuelto', 'rechazado', 'cerrado');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.admin_role not null default 'support',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  username text not null,
  email text not null,
  status public.account_status not null default 'pendiente',
  role text not null default 'jugador',
  last_login_at timestamptz,
  registered_ip inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  leader_player_id uuid references public.players(id) on delete set null,
  members_count integer not null default 0,
  points integer not null default 0,
  guild_level integer not null default 1,
  status text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.characters (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  guild_id uuid references public.guilds(id) on delete set null,
  name text not null,
  level integer not null default 1,
  class text not null,
  faction text,
  gold bigint not null default 0,
  experience bigint not null default 0,
  status text not null default 'activo',
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rankings (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  guild_id uuid references public.guilds(id) on delete cascade,
  ranking_type text not null,
  points integer not null default 0 check (points >= 0),
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  display_name text,
  display_details jsonb not null default '{}'::jsonb check (jsonb_typeof(display_details) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text not null,
  featured_image_url text,
  summary text not null,
  content text not null,
  status public.content_status not null default 'borrador',
  published_at timestamptz,
  author_id uuid references public.profiles(id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  description text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  rewards text,
  status text not null default 'activo',
  event_type text not null,
  participants_count integer not null default 0,
  rules text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text not null,
  category text not null,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.downloads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version text not null,
  download_url text not null,
  file_size text,
  download_type text not null,
  status text not null default 'activo',
  release_notes text,
  is_primary boolean not null default false,
  updated_file_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_player_id uuid references public.players(id) on delete set null,
  reported_player_id uuid references public.players(id) on delete set null,
  reason text not null,
  status public.ticket_status not null default 'pendiente',
  priority text not null default 'media',
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  internal_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete set null,
  category text not null,
  subject text not null,
  message text not null,
  status public.ticket_status not null default 'pendiente',
  priority text not null default 'media',
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff_notes (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references public.players(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  module text not null,
  ip inet,
  details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sanctions (
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

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  message text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players add constraint players_username_key unique (username);
alter table public.players add constraint players_email_key unique (email);
alter table public.players add constraint players_profile_id_key unique (profile_id);

create unique index profiles_username_lower_key on public.profiles(lower(username));
create unique index players_username_lower_key on public.players(lower(username));
create index players_status_idx on public.players(status);
create index characters_player_idx on public.characters(player_id);
create index rankings_type_points_idx on public.rankings(ranking_type, points desc);
create index news_status_published_idx on public.news(status, published_at desc);
create index events_status_starts_idx on public.events(status, starts_at desc);
create index news_public_published_idx on public.news(published_at desc) where status = 'publicado';
create index events_public_schedule_idx on public.events(is_featured desc, starts_at asc) where status in ('activo', 'destacado');
create index reports_status_priority_idx on public.reports(status, priority);
create index tickets_status_priority_idx on public.tickets(status, priority);
create index admin_logs_module_created_idx on public.admin_logs(module, created_at desc);
create index sanctions_player_created_idx on public.sanctions(player_id, created_at desc);
create index ticket_messages_ticket_created_idx on public.ticket_messages(ticket_id, created_at);

create or replace function public.current_admin_role()
returns public.admin_role
language sql
security definer
set search_path = public
as $$
  select role from public.admin_roles where user_id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_roles where user_id = auth.uid());
$$;

alter table public.profiles enable row level security;
alter table public.admin_roles enable row level security;
alter table public.players enable row level security;
alter table public.characters enable row level security;
alter table public.guilds enable row level security;
alter table public.rankings enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.downloads enable row level security;
alter table public.reports enable row level security;
alter table public.tickets enable row level security;
alter table public.staff_notes enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_logs enable row level security;
alter table public.sanctions enable row level security;
alter table public.ticket_messages enable row level security;

create policy "Staff read own role" on public.admin_roles for select
  using (user_id = auth.uid() or public.current_admin_role() = 'super_admin');
create policy "Super admins manage admin roles" on public.admin_roles for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');

create policy "Admins read profiles" on public.profiles for select using (public.is_admin() or id = auth.uid());
create policy "Users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "Admins manage players" on public.players for all using (public.current_admin_role() in ('super_admin', 'admin', 'moderator')) with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));
create policy "Admins manage characters" on public.characters for all using (public.current_admin_role() in ('super_admin', 'admin', 'moderator')) with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));
create policy "Admins manage guilds" on public.guilds for all using (public.current_admin_role() in ('super_admin', 'admin')) with check (public.current_admin_role() in ('super_admin', 'admin'));
create policy "Admins manage rankings" on public.rankings for all using (public.current_admin_role() in ('super_admin', 'admin')) with check (public.current_admin_role() in ('super_admin', 'admin'));
create policy "Editors manage news" on public.news for all using (public.current_admin_role() in ('super_admin', 'admin', 'editor')) with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));
create policy "Editors manage events" on public.events for all using (public.current_admin_role() in ('super_admin', 'admin', 'editor')) with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));
create policy "Editors manage gallery" on public.gallery for all using (public.current_admin_role() in ('super_admin', 'admin', 'editor')) with check (public.current_admin_role() in ('super_admin', 'admin', 'editor'));
create policy "Admins manage downloads" on public.downloads for all using (public.current_admin_role() in ('super_admin', 'admin')) with check (public.current_admin_role() in ('super_admin', 'admin'));
create policy "Support manages reports" on public.reports for all using (public.current_admin_role() in ('super_admin', 'admin', 'moderator', 'support')) with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator', 'support'));
create policy "Support manages tickets" on public.tickets for all using (public.current_admin_role() in ('super_admin', 'support')) with check (public.current_admin_role() in ('super_admin', 'support'));
create policy "Moderators manage staff notes" on public.staff_notes for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'moderator'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));
create policy "Super admins manage settings" on public.site_settings for all using (public.current_admin_role() = 'super_admin') with check (public.current_admin_role() = 'super_admin');
create policy "Staff read permitted logs" on public.admin_logs for select
  using (admin_user_id = auth.uid() or public.current_admin_role() = 'super_admin');
create policy "Staff insert own logs" on public.admin_logs for insert
  with check (public.is_admin() and admin_user_id = auth.uid());
create policy "Moderators manage sanctions" on public.sanctions
  for all
  using (public.current_admin_role() in ('super_admin', 'admin', 'moderator'))
  with check (public.current_admin_role() in ('super_admin', 'admin', 'moderator'));
create policy "Support manages ticket messages" on public.ticket_messages
  for all
  using (public.current_admin_role() in ('super_admin', 'support'))
  with check (public.current_admin_role() in ('super_admin', 'support'));

-- Keep audit timestamps accurate without relying on every client to set them.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'admin_roles', 'players', 'guilds', 'characters', 'rankings',
    'news', 'events', 'gallery', 'downloads', 'reports', 'tickets',
    'staff_notes', 'site_settings', 'admin_logs', 'sanctions', 'ticket_messages'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', table_name);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name
    );
  end loop;
end;
$$;

-- Every Auth account gets the profile required by the relational model.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, new.id::text), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.players (profile_id, email, username, status)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email, new.id::text), '@', 1)),
    'pendiente'
  )
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Public website reads. Mutations remain protected by the role policies above.
create policy "Public reads visible rankings" on public.rankings
  for select using (is_visible);
create policy "Public reads published news" on public.news
  for select using (status = 'publicado' and published_at is not null and published_at <= now());
create policy "Public reads active events" on public.events
  for select using (status in ('activo', 'destacado') and (ends_at is null or ends_at >= now()));
create policy "Public reads public settings" on public.site_settings
  for select using (key in ('public_config', 'public_metrics', 'public_content'));
create policy "Public reads active gallery" on public.gallery
  for select using (is_active);
create policy "Public reads active downloads" on public.downloads
  for select using (status = 'activo');

-- Public settings are the only site_settings keys exposed by RLS.
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

-- Replace broad moderator write access with explicit read/write boundaries.
drop policy "Admins manage players" on public.players;
create policy "Admins write players" on public.players
  for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));
create policy "Moderators read players" on public.players
  for select using (public.current_admin_role() = 'moderator');

drop policy "Admins manage characters" on public.characters;
create policy "Admins write characters" on public.characters
  for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));
create policy "Moderators read characters" on public.characters
  for select using (public.current_admin_role() = 'moderator');

-- Profiles and roles are staff administration, not general admin data.
drop policy "Admins read profiles" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "Super admins read profiles" on public.profiles
  for select using (public.current_admin_role() = 'super_admin');
create policy "Super admins manage profiles" on public.profiles
  for all
  using (public.current_admin_role() = 'super_admin')
  with check (public.current_admin_role() = 'super_admin');

-- Public gallery assets. Uploads and mutations are limited to content editors.
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = excluded.public;

create policy "Public reads gallery assets" on storage.objects
  for select using (bucket_id = 'gallery');
create policy "Editors upload gallery assets" on storage.objects
  for insert
  with check (
    bucket_id = 'gallery'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );
create policy "Editors update gallery assets" on storage.objects
  for update
  using (
    bucket_id = 'gallery'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  )
  with check (
    bucket_id = 'gallery'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );
create policy "Editors delete gallery assets" on storage.objects
  for delete
  using (
    bucket_id = 'gallery'
    and public.current_admin_role() in ('super_admin', 'admin', 'editor')
  );

-- Flexible public CMS. The complete idempotent seeds and media-bucket setup live
-- in public-full-cms-migration.sql and should be applied after this foundation.
create or replace function public.is_public_cms_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('super_admin', 'admin', 'editor'), false);
$$;

create table public.public_sections (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  title text not null,
  description text,
  section_type text not null default 'content',
  location text not null default 'landing',
  status public.content_status not null default 'publicado',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_sections_key_format check (key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint public_sections_type_check check (section_type in (
    'navigation', 'hero', 'metrics', 'world', 'systems', 'character_paths',
    'ranking', 'events', 'downloads', 'media', 'gallery', 'community',
    'news', 'faq', 'footer', 'cta', 'parallax', 'content'
  )),
  constraint public_sections_location_format check (location ~ '^[a-z0-9][a-z0-9_/-]*$'),
  constraint public_sections_metadata_object check (jsonb_typeof(metadata) = 'object'),
  constraint public_sections_publication_window check (expires_at is null or expires_at > published_at)
);

create table public.public_content (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.public_sections(id) on delete cascade,
  key text not null,
  content_type text not null default 'item',
  title text,
  subtitle text,
  body text,
  href text,
  media_url text,
  media_type text,
  icon text,
  status public.content_status not null default 'publicado',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  data jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint public_content_section_key_unique unique (section_id, key),
  constraint public_content_key_format check (key ~ '^[a-z0-9][a-z0-9_-]*$'),
  constraint public_content_type_check check (content_type in (
    'item', 'card', 'link', 'cta', 'media', 'faq', 'metric', 'feature',
    'path', 'requirement', 'chapter', 'text', 'config', 'ranking_snapshot'
  )),
  constraint public_content_media_type_check check (
    media_type is null or media_type in ('image', 'video', 'file', 'external', 'none')
  ),
  constraint public_content_href_format check (href is null or href ~ '^(#|/|https?://)'),
  constraint public_content_media_url_format check (media_url is null or media_url ~ '^(/|https?://)'),
  constraint public_content_data_object check (jsonb_typeof(data) = 'object'),
  constraint public_content_not_empty check (
    nullif(title, '') is not null
    or nullif(subtitle, '') is not null
    or nullif(body, '') is not null
    or nullif(href, '') is not null
    or nullif(media_url, '') is not null
    or data <> '{}'::jsonb
  ),
  constraint public_content_publication_window check (expires_at is null or expires_at > published_at)
);

create index public_sections_active_order_idx
  on public.public_sections(location, sort_order, key)
  where status = 'publicado' and is_active;
create index public_sections_type_order_idx on public.public_sections(section_type, sort_order);
create index public_content_active_order_idx
  on public.public_content(section_id, sort_order, key)
  where status = 'publicado' and is_active;
create index public_content_type_idx on public.public_content(content_type, sort_order);
create index public_content_data_gin_idx on public.public_content using gin(data);
create index downloads_public_active_idx
  on public.downloads(is_primary desc, updated_file_at desc, created_at desc)
  where status = 'activo';
create index gallery_public_active_idx
  on public.gallery(sort_order, created_at desc)
  where is_active;
create index rankings_public_visible_idx
  on public.rankings(ranking_type, is_featured desc, points desc)
  where is_visible;

alter table public.public_sections enable row level security;
alter table public.public_content enable row level security;

create policy "Public reads active public sections" on public.public_sections
  for select
  using (
    is_active
    and status = 'publicado'
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );
create policy "Editors manage public sections" on public.public_sections
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

create policy "Public reads active public content" on public.public_content
  for select
  using (
    is_active
    and status = 'publicado'
    and published_at <= now()
    and (expires_at is null or expires_at > now())
    and exists (
      select 1
      from public.public_sections section
      where section.id = public_content.section_id
        and section.is_active
        and section.status = 'publicado'
        and section.published_at <= now()
        and (section.expires_at is null or section.expires_at > now())
    )
  );
create policy "Editors manage public content" on public.public_content
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

grant select on public.public_sections, public.public_content to anon, authenticated;
grant insert, update, delete on public.public_sections, public.public_content to authenticated;

create trigger set_updated_at
  before update on public.public_sections
  for each row execute function public.set_updated_at();
create trigger set_updated_at
  before update on public.public_content
  for each row execute function public.set_updated_at();

create view public.public_page_content
with (security_invoker = true)
as
select
  section.id,
  section.key,
  section.title,
  section.description,
  section.section_type,
  section.location,
  section.sort_order,
  section.metadata,
  coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', content.id,
        'key', content.key,
        'type', content.content_type,
        'title', content.title,
        'subtitle', content.subtitle,
        'body', content.body,
        'href', content.href,
        'mediaUrl', content.media_url,
        'mediaType', content.media_type,
        'icon', content.icon,
        'sortOrder', content.sort_order,
        'data', content.data
      )
      order by content.sort_order, content.key
    ) filter (where content.id is not null),
    '[]'::jsonb
  ) as items
from public.public_sections section
left join public.public_content content
  on content.section_id = section.id
  and content.is_active
  and content.status = 'publicado'
  and content.published_at <= now()
  and (content.expires_at is null or content.expires_at > now())
where
  section.is_active
  and section.status = 'publicado'
  and section.published_at <= now()
  and (section.expires_at is null or section.expires_at > now())
group by
  section.id,
  section.key,
  section.title,
  section.description,
  section.section_type,
  section.location,
  section.sort_order,
  section.metadata
order by section.sort_order, section.key;

grant select on public.public_page_content to anon, authenticated;

create view public.public_ranking_entries
with (security_invoker = true)
as
select
  id,
  ranking_type,
  points,
  is_featured,
  display_name,
  display_details,
  updated_at
from public.rankings
where is_visible;

grant select on public.public_ranking_entries to anon, authenticated;
