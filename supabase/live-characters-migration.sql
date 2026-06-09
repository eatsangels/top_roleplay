-- ============================================================
-- TOP ROLEPLAY · Fase 10 · Personajes en vivo (puente SQL Server -> Supabase)
-- ============================================================
-- Crea la tabla que el puente Node (bridge/sync-characters.mjs) rellena
-- leyendo gamedb.dbo.character del GameServer (SOLO LECTURA del juego).
--
-- live_characters: una fila por personaje del juego (clave estable cha_id).
--   Publica unicamente los datos de ROL: faccion, rango, reputacion, nivel de
--   busqueda (wanted) y contadores de arrestos/kills/muertes. NO se publica el
--   oro ni datos privados de la cuenta.
--
--   faction: 0 Civil · 1 Argent Police Force · 2 Sea Shadow Syndicate
--            3 Abyssal Reavers · 4 Crimson Tide Outlaws · 5 Iron Skull Brotherhood
--
-- Seguridad: lectura publica (la web la consume sin login). La escritura la hace
-- SOLO el puente con la SERVICE ROLE KEY (ignora RLS), asi que no se crea ninguna
-- policy de insert/update para anon.
-- Idempotente: seguro de reaplicar.
-- ============================================================

create table if not exists public.live_characters (
  id                uuid primary key default gen_random_uuid(),
  cha_id            bigint not null unique,
  cha_name          text not null,
  faction           smallint not null default 0,
  faction_name      text not null default 'Civil',
  faction_rank      smallint not null default 0,
  reputation_points integer not null default 0,
  wanted_level      smallint not null default 0,
  total_arrests     integer not null default 0,
  total_kills       integer not null default 0,
  total_deaths      integer not null default 0,
  guild_name        text,
  synced_at         timestamptz not null default now()
);

-- Indices para las consultas de la web (Mas Buscados, rosters por faccion).
create index if not exists live_characters_wanted_idx
  on public.live_characters (wanted_level desc);
create index if not exists live_characters_faction_idx
  on public.live_characters (faction);
create index if not exists live_characters_reputation_idx
  on public.live_characters (reputation_points desc);

alter table public.live_characters enable row level security;

-- Lectura publica.
drop policy if exists "live_characters_public_read" on public.live_characters;
create policy "live_characters_public_read"
  on public.live_characters for select using (true);
