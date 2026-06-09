# Puente de datos · TOP ROLEPLAY (Fase 10)

Sincroniza datos reales del GameServer (Tales of Pirates / PKO) hacia Supabase
para que la web los muestre en vivo. **Solo lectura del lado del juego**: el
puente nunca escribe ni modifica el servidor; únicamente lee archivos.

## Módulos

| Script | Lee | Escribe en Supabase |
| --- | --- | --- |
| `sync-ranking.mjs` | `ranking_data.lua` (Fase 8) | `live_rankings`, `live_season` |
| `sync-characters.mjs` | `gamedb.dbo.character` (SQL Server) | `live_characters` |
| `sync-online.mjs` | `AccountServer.dbo.account_login` (SQL Server) | `live_server_status` |

> Próximos módulos previstos (no incluidos aún): territorios y arrestos.

## Requisitos

- Node 20+ (usa `--env-file`, incluido en Node 20).
- Las claves de Supabase ya presentes en `.env.local` de la raíz:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`  ← el puente la usa para escribir (ignora RLS).

## 1) Crear las tablas en Supabase

En el panel de Supabase → SQL Editor, ejecuta una vez:

```
supabase/live-rankings-migration.sql
```

## 2) Configurar la ruta del archivo del juego (opcional)

Por defecto el puente busca `ranking_data.lua` en la ruta del servidor de este
equipo. Si tu servidor está en otra carpeta, añade a `.env.local`:

```
BRIDGE_RANKING_DATA_PATH=C:\\ruta\\a\\4-GameServer\\resource\\script\\calculate\\ranking_data.lua
```

Variables opcionales:

```
BRIDGE_SEASON_DAYS=30      # duración de temporada (debe coincidir con RANK_SEASON_DURATION)
BRIDGE_TOP_N=10            # puestos por categoría que se publican
BRIDGE_INTERVAL_MS=60000   # frecuencia de re-sync en modo bucle
```

## 3) Ejecutar

```bash
# Probar el parser sin tocar Supabase (imprime el JSON parseado)
npm run bridge:ranking:test

# Sincronizar una sola vez
npm run bridge:ranking

# Sincronizar en bucle (cada BRIDGE_INTERVAL_MS)
npm run bridge:ranking:watch
```

La web publica el resultado en **`/ranking`** (se revalida cada 30 s).

## Cómo funciona

1. Lee el archivo plano `ranking_data.lua` que genera `ranking_system.lua`.
2. Lo parsea con un tokenizador minimal (no usa `eval`).
3. Calcula el top-N por categoría (arrestos `a`, eliminaciones `k`,
   contrabando `s`, reputación `r`) en los tableros temporada/semanal/diario.
4. Reemplaza `live_rankings` y actualiza `live_season` (meta + Salón de la Fama
   + prestigio).

## Automatización (opcional)

Para mantenerlo siempre actualizado, programa `npm run bridge:ranking` con el
Programador de tareas de Windows (p. ej. cada 5 minutos), o deja
`npm run bridge:ranking:watch` corriendo en una ventana.

---

# Módulo de personajes · `sync-characters.mjs`

Lee `gamedb.dbo.character` del GameServer en **SQL Server** (SOLO LECTURA, con
`WITH (NOLOCK)`, nunca escribe en la base del juego) y publica en Supabase
(`live_characters`) únicamente los datos de **ROL**: facción, rango, reputación,
nivel de búsqueda (wanted) y contadores de arrestos/kills/muertes. **No publica
oro ni datos privados de la cuenta** (decisión de privacidad).

La web lo muestra en **`/buscados`** (Más Buscados + rosters de facción +
leaderboards de reputación/arrestos), revalidada cada 30 s.

## 1) Crear la tabla en Supabase

En el panel de Supabase → SQL Editor, ejecuta una vez:

```
supabase/live-characters-migration.sql
```

## Transporte: memoria compartida (no TCP)

Igual que `sync-online.mjs`, este puente consulta por **memoria compartida** con
**PowerShell + `System.Data.SqlClient`** apuntando a `.\TOPSERVER`, porque el
TCP/IP de esta instancia rechaza el handshake de pre-login. La consulta es un
único `SELECT ... WITH (NOLOCK)` y las filas se devuelven como JSON por stdout.

## 2) Credenciales SQL Server en `.env.local`

Añade un usuario SQL de **solo lectura** sobre `gamedb` (no uses `sa` en
producción si puedes evitarlo). Debe tener `SELECT` sobre `dbo.character` y
`dbo.guild`:

```
BRIDGE_GAMEDB_USER=tu_usuario_lectura
BRIDGE_GAMEDB_PASSWORD="tu_password"        # secreto · NO commitear (comillas dobles si tiene #)
```

Variables opcionales (con sus valores por defecto):

```
BRIDGE_GAMEDB_LOCAL_SERVER=.\TOPSERVER   # destino local (memoria compartida)
BRIDGE_GAMEDB_DATABASE=gamedb
BRIDGE_CHAR_INTERVAL_MS=60000            # frecuencia de re-sync en modo bucle
```

## 3) Ejecutar

```bash
# Sincronizar una sola vez
npm run bridge:characters

# Sincronizar en bucle (cada BRIDGE_CHAR_INTERVAL_MS)
npm run bridge:characters:watch
```

## Cómo funciona

1. Lanza una consulta local por **memoria compartida** (PowerShell +
   `System.Data.SqlClient` a `.\TOPSERVER`); no usa TCP.
2. Hace un único `SELECT ... WITH (NOLOCK)` sobre `dbo.[character]` con `LEFT
   JOIN dbo.[guild]` para el nombre del clan.
3. Mapea `faction` (0–5) a su nombre legible (debe coincidir con
   `faction_system.lua` `FACTION_NAMES`).
4. Hace `upsert` en `live_characters` por `cha_id` en lotes de 500.

## Seguridad

- El puente **solo hace SELECT** contra el juego; nunca `INSERT`/`UPDATE`/`DELETE`.
- Usa un usuario SQL de solo lectura.
- La tabla pública omite el oro y cualquier dato de cuenta.

---

# Módulo de jugadores en línea · `sync-online.mjs`

Cuenta los jugadores **realmente conectados** leyendo
`AccountServer.dbo.account_login` en **SQL Server** (SOLO LECTURA, con `WITH
(NOLOCK)`) y publica el número en Supabase (`live_server_status`, una sola fila).
La web sustituye con ese valor la métrica **"Jugadores TOP online"** de la
portada (revalidada cada 30 s).

El motor pone `login_status <> 0` mientras una cuenta está en línea (lo marca
AccountServer/GateServer al entrar y lo limpia al salir). El puente cuenta esas
filas:

```sql
SELECT COUNT(*) FROM dbo.account_login WITH (NOLOCK) WHERE login_status <> 0
```

> **Nota:** si un GameServer cae sin logout limpio, `login_status` puede quedar
> "pegado" en línea hasta el próximo login/logout de esa cuenta. Es un límite del
> motor, no del puente.

### Filtro de cuentas fantasma

Como el puente es **solo lectura** (no puede resetear `login_status` en la base
del juego), descarta esas cuentas "pegadas" en la propia consulta exigiendo que la
sesión sea **reciente y abierta de verdad**:

```sql
SELECT COUNT(*) FROM dbo.account_login WITH (NOLOCK)
WHERE login_status <> 0
  AND last_login_time > last_logout_time                       -- login posterior al último logout
  AND last_login_time >= DATEADD(hour, -24, GETDATE())         -- sesión iniciada hace < 24 h
```

Así una cuenta cuyo último login es más antiguo que su último logout (o más viejo
que la ventana) se considera offline aunque su `login_status` siga `<> 0`. Ajusta
la ventana con `BRIDGE_ONLINE_MAX_HOURS` si tienes jugadores con sesiones
continuas más largas que 24 h.

## Transporte: memoria compartida (no TCP)

El TCP/IP de esta instancia de SQL Server **rechaza el handshake de pre-login**
(falla incluso con .NET y `sqlcmd` por TCP), pero la **memoria compartida** local
funciona igual que el juego. Como el puente corre en la **misma máquina** que el
SQL Server, `sync-online.mjs` consulta lanzando una consulta local con
**PowerShell + `System.Data.SqlClient`** apuntando a `.\TOPSERVER`. Así no
depende del SQL Browser, del puerto dinámico ni del TCP.

## 1) Crear la tabla en Supabase

```
supabase/live-server-status-migration.sql
```

## 2) Credenciales SQL Server en `.env.local`

Reutiliza el mismo usuario de solo lectura de `sync-characters.mjs` (debe tener
además permiso `SELECT` sobre `AccountServer.dbo.account_login`):

```
BRIDGE_GAMEDB_USER=tu_usuario_lectura
BRIDGE_GAMEDB_PASSWORD="tu_password"        # secreto · NO commitear
```

> **IMPORTANTE — comillas dobles:** si la contraseña tiene `#` (o espacios),
> enciérrala entre **comillas dobles**. Node `--env-file` trata el `#` sin comillas
> como comentario y trunca el valor (p. ej. `Y87dm#$45` quedaría como `Y87dm`).
> Las comillas **simples** NO las quita Node, así que tampoco sirven.

Variables opcionales (con sus valores por defecto):

```
BRIDGE_GAMEDB_LOCAL_SERVER=.\TOPSERVER   # destino local (memoria compartida)
BRIDGE_ACCOUNTDB_DATABASE=AccountServer
BRIDGE_ONLINE_INTERVAL_MS=30000          # frecuencia de re-sync en modo bucle
BRIDGE_ONLINE_MAX_HOURS=24               # ventana para descartar sesiones fantasma (ver Filtro)
```

## 3) Ejecutar

```bash
# Sincronizar una sola vez
npm run bridge:online

# Sincronizar en bucle (cada BRIDGE_ONLINE_INTERVAL_MS)
npm run bridge:online:watch
```
