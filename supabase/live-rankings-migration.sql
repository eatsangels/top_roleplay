-- ============================================================
-- TOP ROLEPLAY · Fase 10 · Ranking en vivo (puente GameServer -> Supabase)
-- ============================================================
-- Crea las tablas que el puente Node (bridge/sync-ranking.mjs) rellena
-- leyendo resource/script/calculate/ranking_data.lua del GameServer.
--
-- live_rankings: una fila por (tablero, categoria, puesto).
--   board    = 'season' | 'weekly' | 'daily'
--   category = 'a' (arrestos) | 'k' (eliminaciones) | 's' (contrabando) | 'r' (reputacion)
-- live_season: una unica fila (id=1) con meta de la temporada actual,
--   Salon de la Fama (champions) y prestigio.
--
-- Seguridad: lectura publica (la web la consume sin login). La escritura
-- la hace SOLO el puente con la SERVICE ROLE KEY, que ignora RLS, asi que
-- no se crea ninguna policy de insert/update para anon.
-- Idempotente: seguro de reaplicar.
-- ============================================================

create table if not exists public.live_rankings (
  id             uuid primary key default gen_random_uuid(),
  board          text not null,
  category       text not null,
  category_label text not null,
  rank           integer not null,
  player_name    text not null,
  score          bigint not null default 0,
  season_id      integer not null default 1,
  synced_at      timestamptz not null default now(),
  unique (board, category, rank)
);

create index if not exists live_rankings_board_category_idx
  on public.live_rankings (board, category, rank);

create table if not exists public.live_season (
  id            integer primary key default 1,
  season_id     integer not null default 1,
  season_start  timestamptz,
  total_days    integer not null default 30,
  days_elapsed  integer not null default 0,
  days_left     integer not null default 30,
  champions     jsonb not null default '[]'::jsonb,
  prestige      jsonb not null default '[]'::jsonb,
  synced_at     timestamptz not null default now(),
  constraint live_season_singleton check (id = 1)
);

alter table public.live_rankings enable row level security;
alter table public.live_season   enable row level security;

-- Lectura publica.
drop policy if exists "live_rankings_public_read" on public.live_rankings;
create policy "live_rankings_public_read"
  on public.live_rankings for select using (true);

drop policy if exists "live_season_public_read" on public.live_season;
create policy "live_season_public_read"
  on public.live_season for select using (true);

-- Fila semilla para live_season (evita estado vacio antes del primer sync).
insert into public.live_season (id, season_id, total_days, days_left)
values (1, 1, 30, 30)
on conflict (id) do nothing;
