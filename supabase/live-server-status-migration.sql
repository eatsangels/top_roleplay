-- ============================================================
-- TOP ROLEPLAY · Fase 10 · Estado del servidor en vivo (jugadores en linea)
-- ============================================================
-- Crea la tabla que el puente Node (bridge/sync-online.mjs) actualiza leyendo
-- AccountServer.dbo.account_login del servidor (SOLO LECTURA del juego).
--
-- live_server_status: UNA sola fila (id = 1). Publica el numero real de
--   jugadores conectados (online_count) y un flag is_online del servidor.
--   El puente cuenta las cuentas con login_status <> 0 en AccountServer.
--
-- Seguridad: lectura publica (la web la consume sin login). La escritura la hace
-- SOLO el puente con la SERVICE ROLE KEY (ignora RLS), asi que no se crea ninguna
-- policy de insert/update para anon.
-- Idempotente: seguro de reaplicar.
-- ============================================================

create table if not exists public.live_server_status (
  id           smallint primary key default 1,
  online_count integer not null default 0,
  peak_today   integer not null default 0,
  is_online    boolean not null default false,
  updated_at   timestamptz not null default now(),
  constraint live_server_status_singleton check (id = 1)
);

-- Garantiza que exista la fila unica desde el principio.
insert into public.live_server_status (id, online_count, peak_today, is_online)
values (1, 0, 0, false)
on conflict (id) do nothing;

alter table public.live_server_status enable row level security;

-- Lectura publica.
drop policy if exists "live_server_status_public_read" on public.live_server_status;
create policy "live_server_status_public_read"
  on public.live_server_status for select using (true);
