-- Full public CMS layer for TOP ROLEPLAY.
-- Idempotent: safe to apply more than once after the foundation schema.

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'content_status'
  ) then
    create type public.content_status as enum ('borrador', 'publicado', 'archivado');
  end if;
end;
$$;

create or replace function public.is_public_cms_manager()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_admin_role() in ('super_admin', 'admin', 'editor'), false);
$$;

create table if not exists public.public_sections (
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

create table if not exists public.public_content (
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

alter table public.rankings
  add column if not exists display_name text,
  add column if not exists display_details jsonb not null default '{}'::jsonb;

create index if not exists public_sections_active_order_idx
  on public.public_sections(location, sort_order, key)
  where status = 'publicado' and is_active;

create index if not exists public_sections_type_order_idx
  on public.public_sections(section_type, sort_order);

create index if not exists public_content_active_order_idx
  on public.public_content(section_id, sort_order, key)
  where status = 'publicado' and is_active;

create index if not exists public_content_type_idx
  on public.public_content(content_type, sort_order);

create index if not exists public_content_data_gin_idx
  on public.public_content using gin(data);

create index if not exists downloads_public_active_idx
  on public.downloads(is_primary desc, updated_file_at desc, created_at desc)
  where status = 'activo';

create index if not exists gallery_public_active_idx
  on public.gallery(sort_order, created_at desc)
  where is_active;

create index if not exists rankings_public_visible_idx
  on public.rankings(ranking_type, is_featured desc, points desc)
  where is_visible;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'downloads_status_known'
      and conrelid = 'public.downloads'::regclass
  ) then
    alter table public.downloads
      add constraint downloads_status_known
      check (status in ('activo', 'inactivo', 'archivado')) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'rankings_points_nonnegative'
      and conrelid = 'public.rankings'::regclass
  ) then
    alter table public.rankings
      add constraint rankings_points_nonnegative
      check (points >= 0) not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'rankings_display_details_object'
      and conrelid = 'public.rankings'::regclass
  ) then
    alter table public.rankings
      add constraint rankings_display_details_object
      check (jsonb_typeof(display_details) = 'object') not valid;
  end if;
end;
$$;

alter table public.rankings enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.downloads enable row level security;
alter table public.site_settings enable row level security;
alter table public.public_sections enable row level security;
alter table public.public_content enable row level security;

drop policy if exists "Public reads visible rankings" on public.rankings;
create policy "Public reads visible rankings" on public.rankings
  for select using (is_visible);

drop policy if exists "Admins manage rankings" on public.rankings;
create policy "Admins manage rankings" on public.rankings
  for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));

drop policy if exists "Public reads published news" on public.news;
create policy "Public reads published news" on public.news
  for select using (status = 'publicado' and published_at is not null and published_at <= now());

drop policy if exists "Editors manage news" on public.news;
create policy "Editors manage news" on public.news
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

drop policy if exists "Public reads active events" on public.events;
create policy "Public reads active events" on public.events
  for select using (status in ('activo', 'destacado') and (ends_at is null or ends_at >= now()));

drop policy if exists "Editors manage events" on public.events;
create policy "Editors manage events" on public.events
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

drop policy if exists "Public reads active gallery" on public.gallery;
create policy "Public reads active gallery" on public.gallery
  for select using (is_active);

drop policy if exists "Editors manage gallery" on public.gallery;
create policy "Editors manage gallery" on public.gallery
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

drop policy if exists "Public reads active downloads" on public.downloads;
create policy "Public reads active downloads" on public.downloads
  for select using (status = 'activo');

drop policy if exists "Admins manage downloads" on public.downloads;
create policy "Admins manage downloads" on public.downloads
  for all
  using (public.current_admin_role() in ('super_admin', 'admin'))
  with check (public.current_admin_role() in ('super_admin', 'admin'));

drop policy if exists "Public reads public settings" on public.site_settings;
create policy "Public reads public settings" on public.site_settings
  for select using (key in ('public_config', 'public_metrics', 'public_content'));

drop policy if exists "Public reads active public sections" on public.public_sections;
create policy "Public reads active public sections" on public.public_sections
  for select
  using (
    is_active
    and status = 'publicado'
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "Editors manage public sections" on public.public_sections;
create policy "Editors manage public sections" on public.public_sections
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

drop policy if exists "Public reads active public content" on public.public_content;
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

drop policy if exists "Editors manage public content" on public.public_content;
create policy "Editors manage public content" on public.public_content
  for all
  using (public.is_public_cms_manager())
  with check (public.is_public_cms_manager());

grant select on public.public_sections, public.public_content to anon, authenticated;
grant insert, update, delete on public.public_sections, public.public_content to authenticated;

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

drop trigger if exists set_updated_at on public.public_sections;
create trigger set_updated_at
  before update on public.public_sections
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.public_content;
create trigger set_updated_at
  before update on public.public_content
  for each row execute function public.set_updated_at();

create or replace view public.public_page_content
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

create or replace view public.public_ranking_entries
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

insert into public.public_sections (key, title, description, section_type, location, sort_order, metadata)
values
  ('navigation', 'Navegación principal', 'Enlaces del encabezado y menú móvil.', 'navigation', 'landing', 10, '{"source":"current_site"}'::jsonb),
  ('hero_ctas', 'Acciones del héroe', 'Botones principales de entrada a la experiencia.', 'hero', 'landing', 20, '{"source":"current_site"}'::jsonb),
  ('world', 'El mundo de TOP ROLEPLAY', 'Bloque narrativo sobre el mundo y su fantasía.', 'world', 'landing', 30, '{"anchor":"mundo","eyebrow":"La leyenda de TOP ROLEPLAY","tags":["Roleplay","Combate","Comercio"]}'::jsonb),
  ('systems', 'Sistemas TOP ROLEPLAY', 'Sistemas y features públicas.', 'systems', 'landing', 40, '{"anchor":"sistemas","eyebrow":"Sistemas TOP ROLEPLAY","headline":"Todo está diseñado para crear roleplay"}'::jsonb),
  ('character_paths', 'Rutas de personaje', 'Opciones de identidad para nuevos jugadores.', 'character_paths', 'landing', 50, '{"eyebrow":"Tu identidad en TOP ROLEPLAY","headline":"Elige cómo vivir tu historia"}'::jsonb),
  ('parallax_chapters', 'Capítulos parallax', 'Bandas narrativas de transición.', 'parallax', 'landing', 60, '{"source":"current_site"}'::jsonb),
  ('ranking_public', 'Ranking TOP ROLEPLAY', 'Snapshot editorial del ranking público.', 'ranking', 'landing', 70, '{"anchor":"ranking","eyebrow":"El TOP de la comunidad","headline":"Ranking TOP ROLEPLAY"}'::jsonb),
  ('events_public', 'Historias y eventos activos', 'Cabecera editorial de agenda pública.', 'events', 'landing', 80, '{"anchor":"eventos","eyebrow":"Agenda TOP ROLEPLAY","headline":"Historias y eventos activos"}'::jsonb),
  ('downloads_public', 'Entra a TOP ROLEPLAY', 'Descargas, requisitos y accesos de cuenta.', 'downloads', 'landing', 90, '{"anchor":"descargas"}'::jsonb),
  ('trailer_media', 'Mira el tráiler', 'Medio principal de cinemática pública.', 'media', 'landing', 100, '{"anchor":"trailer","eyebrow":"Cinemática TOP ROLEPLAY"}'::jsonb),
  ('gallery_public', 'El universo de TOP ROLEPLAY', 'Galería pública y categorías visuales.', 'gallery', 'landing', 110, '{"anchor":"galeria","eyebrow":"Galería"}'::jsonb),
  ('community_cta', 'Únete a TOP ROLEPLAY', 'CTA de comunidad y Discord.', 'community', 'landing', 120, '{"anchor":"comunidad"}'::jsonb),
  ('news_public', 'Noticias y actualizaciones', 'Bitácora oficial pública.', 'news', 'landing', 130, '{"anchor":"noticias","eyebrow":"Bitácora oficial"}'::jsonb),
  ('faq_public', 'Preguntas frecuentes', 'Soporte inicial para nuevos jugadores.', 'faq', 'landing', 140, '{"anchor":"faq","eyebrow":"Soporte"}'::jsonb),
  ('footer_public', 'Footer público', 'Marca, enlaces rápidos, comunidad y legal.', 'footer', 'landing', 150, '{"source":"current_site"}'::jsonb)
on conflict (key) do nothing;

with seed(section_key, key, content_type, title, subtitle, body, href, media_url, media_type, icon, sort_order, data) as (
  values
  ('navigation', 'inicio', 'link', 'Inicio', null, null, '#inicio', null, null, null, 10, '{}'::jsonb),
  ('navigation', 'mundo', 'link', 'Mundo', null, null, '#mundo', null, null, null, 20, '{}'::jsonb),
  ('navigation', 'sistemas', 'link', 'Sistemas', null, null, '#sistemas', null, null, null, 30, '{}'::jsonb),
  ('navigation', 'ranking', 'link', 'Ranking', null, null, '#ranking', null, null, null, 40, '{}'::jsonb),
  ('navigation', 'eventos', 'link', 'Eventos', null, null, '#eventos', null, null, null, 50, '{}'::jsonb),
  ('navigation', 'descargas', 'link', 'Descargas', null, null, '#descargas', null, null, null, 60, '{}'::jsonb),
  ('navigation', 'comunidad', 'link', 'Comunidad', null, null, '#comunidad', null, null, null, 70, '{}'::jsonb),
  ('hero_ctas', 'download_client', 'cta', 'Descargar Cliente', null, null, '/downloads/top-roleplay-client.txt', null, null, 'Download', 10, '{"download":true,"variant":"primary"}'::jsonb),
  ('hero_ctas', 'how_to_start', 'cta', 'Cómo empezar', null, null, '#descargas', null, null, 'Gamepad2', 20, '{"variant":"secondary"}'::jsonb),
  ('hero_ctas', 'watch_trailer', 'cta', 'Ver Tráiler', null, null, '#trailer', null, null, null, 30, '{"variant":"ghost"}'::jsonb),
  ('world', 'world_card', 'card', 'El mundo de TOP ROLEPLAY', null, 'La entrada a rutas comerciales, contratos peligrosos y rumores que solo sobreviven en tabernas oscuras.', null, null, null, 'Anchor', 10, '{}'::jsonb),
  ('world', 'legend_text', 'text', 'Roleplay con identidad, riesgo y memoria.', 'La leyenda de TOP ROLEPLAY', 'TOP ROLEPLAY está pensado como una campaña viva: no solo subes nivel, también negocias, improvisas, eliges aliados y aceptas consecuencias. La fantasía pirata se apoya en contraste alto, oro gastado, cyan mágico y carmesí de guerra.', null, null, null, null, 20, '{"tags":["Roleplay","Combate","Comercio"]}'::jsonb),
  ('systems', 'roleplay_con_consecuencia', 'feature', 'Roleplay con Consecuencia', null, 'Identidad, reputación, conflictos y alianzas que dejan marca en el mundo persistente.', null, null, null, 'BookOpen', 10, '{}'::jsonb),
  ('systems', 'economia_de_puerto', 'feature', 'Economía de Puerto', null, 'Comercios, oficios, mercado entre jugadores y rutas de botín que cambian cada semana.', null, null, null, 'Gem', 20, '{}'::jsonb),
  ('systems', 'conflicto_naval_pvp', 'feature', 'Conflicto Naval y PvP', null, 'Duelos, guerras de clanes, arenas y asaltos con recompensas para quienes arriesgan.', null, null, null, 'Swords', 30, '{}'::jsonb),
  ('systems', 'misiones_de_staff', 'feature', 'Misiones de Staff', null, 'Narrativas guiadas, NPCs únicos, pistas en Discord y eventos para tripulaciones completas.', null, null, null, 'ScrollText', 40, '{}'::jsonb),
  ('systems', 'exploracion_pirata', 'feature', 'Exploración Pirata', null, 'Islas ocultas, ruinas, mazmorras y mapas antiguos para capitanes que leen el viento.', null, null, null, 'Map', 50, '{}'::jsonb),
  ('systems', 'comunidad_viva', 'feature', 'Comunidad Viva', null, 'Soporte activo, tickets, eventos sociales y un circuito claro para nuevos jugadores.', null, null, null, 'MessageCircle', 60, '{}'::jsonb),
  ('character_paths', 'pirata', 'path', 'Pirata', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 10, '{}'::jsonb),
  ('character_paths', 'mercenario', 'path', 'Mercenario', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 20, '{}'::jsonb),
  ('character_paths', 'comerciante', 'path', 'Comerciante', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 30, '{}'::jsonb),
  ('character_paths', 'marinero', 'path', 'Marinero', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 40, '{}'::jsonb),
  ('character_paths', 'cazador_de_tesoros', 'path', 'Cazador de Tesoros', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 50, '{}'::jsonb),
  ('character_paths', 'capitan_de_clan', 'path', 'Capitán de Clan', null, 'Forja reputación, gana aliados y deja una firma reconocible en la historia del servidor.', null, null, null, 'Skull', 60, '{}'::jsonb),
  ('parallax_chapters', 'capitulo_i', 'chapter', 'Tu personaje no entra a un servidor. Entra a una historia viva.', 'TOP ROLEPLAY · Capítulo I', null, null, null, null, 'Anchor', 10, '{}'::jsonb),
  ('parallax_chapters', 'capitulo_ii', 'chapter', 'Elige quién quieres ser. La comunidad recordará lo que hagas.', 'TOP ROLEPLAY · Capítulo II', null, null, null, null, 'Skull', 20, '{}'::jsonb),
  ('parallax_chapters', 'capitulo_iii', 'chapter', 'Tu reputación se gana jugando. Tu nombre llega al TOP creando historia.', 'TOP ROLEPLAY · Capítulo III', null, null, null, null, 'Swords', 30, '{}'::jsonb),
  ('parallax_chapters', 'capitulo_iv', 'chapter', 'Deja de mirar la historia desde fuera. Entra y protagonízala.', 'TOP ROLEPLAY · Capítulo IV', null, null, null, null, 'Compass', 40, '{}'::jsonb),
  ('ranking_public', 'aureliostorm', 'ranking_snapshot', 'AurelioStorm', 'Red Kraken', null, null, null, null, null, 10, '{"level":95,"points":"98.410","online":true}'::jsonb),
  ('ranking_public', 'mikaeldmar', 'ranking_snapshot', 'MikaelDMar', 'Corsarios', null, null, null, null, null, 20, '{"level":92,"points":"91.220","online":true}'::jsonb),
  ('ranking_public', 'namivalkyr', 'ranking_snapshot', 'NamiValkyr', 'Marea Roja', null, null, null, null, null, 30, '{"level":90,"points":"87.630","online":false}'::jsonb),
  ('ranking_public', 'blackrune', 'ranking_snapshot', 'BlackRune', 'Nocturnos', null, null, null, null, null, 40, '{"level":88,"points":"81.940","online":true}'::jsonb),
  ('ranking_public', 'capitanalyra', 'ranking_snapshot', 'CapitanaLyra', 'Ala Dorada', null, null, null, null, null, 50, '{"level":86,"points":"79.505","online":false}'::jsonb),
  ('downloads_public', 'download_copy', 'text', 'Entra a TOP ROLEPLAY', null, 'Descarga el cliente oficial, crea tu cuenta y comienza a construir una identidad que la comunidad recuerde.', null, null, null, 'Download', 10, '{}'::jsonb),
  ('downloads_public', 'req_windows', 'requirement', 'Windows 10/11', null, null, null, null, null, null, 20, '{}'::jsonb),
  ('downloads_public', 'req_ram', 'requirement', '4GB RAM mínimo', null, null, null, null, null, null, 30, '{}'::jsonb),
  ('downloads_public', 'req_space', 'requirement', '2GB espacio disponible', null, null, null, null, null, null, 40, '{}'::jsonb),
  ('downloads_public', 'req_internet', 'requirement', 'Internet estable', null, null, null, null, null, null, 50, '{}'::jsonb),
  ('trailer_media', 'logo_reveal_trailer', 'media', 'Mira el tráiler', 'Una pieza breve para establecer tono, escudo y energía visual antes de entrar al juego.', 'Tu navegador no puede reproducir el tráiler.', null, '/Logo_reveal_animation_TOP_ROLEPLAY_202606061133.mp4', 'video', null, 10, '{"poster":"/TOP_ROLEPLAY_traced_real.svg","preload":"metadata"}'::jsonb),
  ('gallery_public', 'puerto_negro', 'media', 'Puerto Negro', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 10, '{"gradient":"from-gold-300/25 via-black to-crimson/50"}'::jsonb),
  ('gallery_public', 'islas_perdidas', 'media', 'Islas Perdidas', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 20, '{"gradient":"from-cyan-magic/25 via-black to-blood"}'::jsonb),
  ('gallery_public', 'batallas', 'media', 'Batallas', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 30, '{"gradient":"from-red-950 via-black to-gold-300/20"}'::jsonb),
  ('gallery_public', 'personajes', 'media', 'Personajes', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 40, '{"gradient":"from-gold-300/25 via-black to-crimson/50"}'::jsonb),
  ('gallery_public', 'eventos', 'media', 'Eventos', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 50, '{"gradient":"from-cyan-magic/25 via-black to-blood"}'::jsonb),
  ('gallery_public', 'mazmorras', 'media', 'Mazmorras', null, 'Ver captura ampliada', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 60, '{"gradient":"from-red-950 via-black to-gold-300/20"}'::jsonb),
  ('community_cta', 'discord', 'cta', 'Únete a TOP ROLEPLAY', 'Entrar al Discord', 'Recibe noticias, participa en eventos, reporta bugs, habla con el staff y encuentra compañeros de aventura.', 'https://discord.com', null, null, 'MessageCircle', 10, '{"variant":"secondary"}'::jsonb),
  ('news_public', 'section_copy', 'text', 'Noticias y actualizaciones', 'Bitácora oficial', 'Cambios, eventos, mantenimientos y novedades del servidor.', null, null, null, null, 10, '{}'::jsonb),
  ('faq_public', 'descargar_cliente', 'faq', '¿Cómo descargo el cliente?', null, 'Pulsa Descargar Cliente, revisa la guía incluida y entra con tu cuenta confirmada.', null, null, null, null, 10, '{}'::jsonb),
  ('faq_public', 'crear_cuenta', 'faq', '¿Cómo creo una cuenta?', null, 'Usa Crear Cuenta, registra tu nombre de jugador y confirma el correo si Supabase lo solicita.', null, null, null, null, 20, '{}'::jsonb),
  ('faq_public', 'servidor_gratis', 'faq', '¿El servidor es gratis?', null, 'Sí. TOP ROLEPLAY es gratis para jugar, con progresión, eventos y comunidad activa.', null, null, null, null, 30, '{}'::jsonb),
  ('faq_public', 'reportar_bugs', 'faq', '¿Dónde reporto bugs?', null, 'Entra al Discord y usa soporte o reportes. El staff revisa incidencias a diario.', null, null, null, null, 40, '{}'::jsonb),
  ('faq_public', 'eventos_semanales', 'faq', '¿Hay eventos semanales?', null, 'Sí. Hay guerras, boss mundial, caza de tesoros, torneos PvP y bonus de experiencia.', null, null, null, null, 50, '{}'::jsonb),
  ('faq_public', 'unirse_clan', 'faq', '¿Puedo unirme a un clan?', null, 'Puedes unirte a una tripulación existente o fundar la tuya al cumplir requisitos internos.', null, null, null, null, 60, '{}'::jsonb),
  ('footer_public', 'brand', 'text', 'TOP ROLEPLAY', null, 'Un mundo donde cada jugador puede crear identidad, reputación y una historia que merece llegar al TOP.', null, '/TOP_ROLEPLAY_traced_real.svg', 'image', null, 10, '{}'::jsonb),
  ('footer_public', 'quick_inicio', 'link', 'Inicio', null, null, '#inicio', null, null, null, 20, '{"group":"Links rápidos"}'::jsonb),
  ('footer_public', 'quick_mundo', 'link', 'Mundo', null, null, '#mundo', null, null, null, 30, '{"group":"Links rápidos"}'::jsonb),
  ('footer_public', 'quick_sistemas', 'link', 'Sistemas', null, null, '#sistemas', null, null, null, 40, '{"group":"Links rápidos"}'::jsonb),
  ('footer_public', 'quick_ranking', 'link', 'Ranking', null, null, '#ranking', null, null, null, 50, '{"group":"Links rápidos"}'::jsonb),
  ('footer_public', 'quick_eventos', 'link', 'Eventos', null, null, '#eventos', null, null, null, 60, '{"group":"Links rápidos"}'::jsonb),
  ('footer_public', 'login', 'link', 'Iniciar Sesión', null, null, '/login', null, null, null, 70, '{"group":"Comunidad"}'::jsonb),
  ('footer_public', 'registro', 'link', 'Crear Cuenta', null, null, '/registro', null, null, null, 80, '{"group":"Comunidad"}'::jsonb),
  ('footer_public', 'discord', 'link', 'Discord', null, null, '#comunidad', null, null, null, 90, '{"group":"Comunidad"}'::jsonb),
  ('footer_public', 'soporte', 'link', 'Soporte', null, null, '#faq', null, null, null, 100, '{"group":"Comunidad"}'::jsonb),
  ('footer_public', 'panel_staff', 'link', 'Panel Staff', null, null, '/admin/login', null, null, null, 110, '{"group":"Comunidad"}'::jsonb),
  ('footer_public', 'copyright', 'text', '© 2026 TOP ROLEPLAY. Todos los derechos reservados.', null, null, null, null, null, null, 120, '{"group":"Legal"}'::jsonb)
)
insert into public.public_content (
  section_id, key, content_type, title, subtitle, body, href, media_url, media_type, icon, sort_order, data
)
select
  section.id,
  seed.key,
  seed.content_type,
  seed.title,
  seed.subtitle,
  seed.body,
  seed.href,
  seed.media_url,
  seed.media_type,
  seed.icon,
  seed.sort_order,
  seed.data
from seed
join public.public_sections section on section.key = seed.section_key
on conflict (section_id, key) do nothing;

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

insert into public.news (title, slug, category, summary, content, status, published_at, seo_title, seo_description)
values
  ('Mareas Carmesí', 'mareas-carmesi', 'Temporada', 'Nuevas rutas marítimas, jefes de isla y recompensas para clanes activos.', 'La temporada Mareas Carmesí abre rutas marítimas, jefes de isla y recompensas especiales para clanes activos.', 'publicado', '2026-06-06 12:00:00+00', 'Mareas Carmesí | TOP ROLEPLAY', 'Nuevas rutas marítimas, jefes de isla y recompensas para clanes activos.'),
  ('La Bóveda del Capitán', 'la-boveda-del-capitan', 'Evento', 'Pistas repartidas por la comunidad para abrir un tesoro global de fin de semana.', 'El evento La Bóveda del Capitán reparte pistas por la comunidad para abrir un tesoro global durante el fin de semana.', 'publicado', '2026-06-04 12:00:00+00', 'La Bóveda del Capitán | TOP ROLEPLAY', 'Pistas repartidas por la comunidad para abrir un tesoro global de fin de semana.'),
  ('Economía y Profesiones', 'economia-y-profesiones', 'Balance', 'Ajustes en comercio marítimo, recompensas PvP y progresión de oficios.', 'Actualización de balance centrada en comercio marítimo, recompensas PvP y progresión de oficios.', 'publicado', '2026-06-01 12:00:00+00', 'Economía y Profesiones | TOP ROLEPLAY', 'Ajustes en comercio marítimo, recompensas PvP y progresión de oficios.')
on conflict (slug) do nothing;

insert into public.events (name, slug, description, starts_at, rewards, status, event_type, is_featured)
values
  ('Guerra de Clanes', 'guerra-de-clanes', 'Competencia semanal para tripulaciones y clanes.', '2026-06-12 22:00:00+00', 'Cofres carmesí y puntos de conquista', 'destacado', 'PvP', true),
  ('Caza del Tesoro', 'caza-del-tesoro', 'Exploración comunitaria con pistas y mapas legendarios.', '2026-06-13 19:30:00+00', 'Mapas legendarios y gemas cyan', 'activo', 'Exploración', false),
  ('Boss Mundial', 'boss-mundial', 'Encuentro PvE global para toda la comunidad.', '2026-06-14 21:00:00+00', 'Drops épicos y skins limitadas', 'activo', 'PvE', false),
  ('Torneo PvP', 'torneo-pvp', 'Torneo competitivo para duelistas.', '2026-06-10 20:00:00+00', 'Corona del duelista', 'activo', 'PvP', false)
on conflict (slug) do nothing;

insert into public.rankings (ranking_type, points, is_featured, is_visible, display_name, display_details)
select *
from (
  values
    ('general', 98410, true, true, 'AurelioStorm', '{"level":95,"clan":"Red Kraken","online":true}'::jsonb),
    ('general', 91220, true, true, 'MikaelDMar', '{"level":92,"clan":"Corsarios","online":true}'::jsonb),
    ('general', 87630, true, true, 'NamiValkyr', '{"level":90,"clan":"Marea Roja","online":false}'::jsonb),
    ('general', 81940, false, true, 'BlackRune', '{"level":88,"clan":"Nocturnos","online":true}'::jsonb),
    ('general', 79505, false, true, 'CapitanaLyra', '{"level":86,"clan":"Ala Dorada","online":false}'::jsonb)
) as seed(ranking_type, points, is_featured, is_visible, display_name, display_details)
where not exists (
  select 1 from public.rankings existing
  where existing.ranking_type = seed.ranking_type
    and existing.display_name = seed.display_name
);

insert into public.downloads (name, version, download_url, file_size, download_type, status, release_notes, is_primary, updated_file_at)
select *
from (
  values
    ('Cliente Oficial TOP ROLEPLAY', '1.0.0', '/downloads/top-roleplay-client.txt', '2GB', 'cliente completo', 'activo', 'Archivo marcador del cliente oficial. Sustituir por el instalador real cuando esté disponible.', true, now()),
    ('Guía de Instalación TOP ROLEPLAY', '1.0.0', '/downloads/guia-instalacion.txt', 'Texto', 'guía', 'activo', 'Pasos de instalación y soporte para nuevos jugadores.', false, now())
) as seed(name, version, download_url, file_size, download_type, status, release_notes, is_primary, updated_file_at)
where not exists (
  select 1 from public.downloads existing
  where existing.download_url = seed.download_url
);

insert into public.gallery (title, description, image_url, category, is_active, is_featured, sort_order)
select *
from (
  values
    ('Puerto Negro', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'mundo', true, true, 10),
    ('Islas Perdidas', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'mundo', true, false, 20),
    ('Batallas', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'combate', true, false, 30),
    ('Personajes', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'personajes', true, false, 40),
    ('Eventos', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'eventos', true, false, 50),
    ('Mazmorras', 'Vista preparada para capturas oficiales del servidor.', '/TOP_ROLEPLAY_traced_real.svg', 'exploracion', true, false, 60)
) as seed(title, description, image_url, category, is_active, is_featured, sort_order)
where not exists (
  select 1 from public.gallery existing
  where lower(existing.title) = lower(seed.title)
    and lower(existing.category) = lower(seed.category)
);

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public reads media assets" on storage.objects;
create policy "Public reads media assets" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "Editors upload media assets" on storage.objects;
create policy "Editors upload media assets" on storage.objects
  for insert
  with check (
    bucket_id = 'media'
    and public.is_public_cms_manager()
  );

drop policy if exists "Editors update media assets" on storage.objects;
create policy "Editors update media assets" on storage.objects
  for update
  using (
    bucket_id = 'media'
    and public.is_public_cms_manager()
  )
  with check (
    bucket_id = 'media'
    and public.is_public_cms_manager()
  );

drop policy if exists "Editors delete media assets" on storage.objects;
create policy "Editors delete media assets" on storage.objects
  for delete
  using (
    bucket_id = 'media'
    and public.is_public_cms_manager()
  );

notify pgrst, 'reload schema';
