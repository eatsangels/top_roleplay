# Puente de datos · TOP ROLEPLAY (Fase 10)

Sincroniza datos reales del GameServer (Tales of Pirates / PKO) hacia Supabase
para que la web los muestre en vivo. **Solo lectura del lado del juego**: el
puente nunca escribe ni modifica el servidor; únicamente lee archivos.

## Módulos

| Script | Lee | Escribe en Supabase |
| --- | --- | --- |
| `sync-ranking.mjs` | `ranking_data.lua` (Fase 8) | `live_rankings`, `live_season` |
| `sync-characters.mjs` | `gamedb.dbo.character` (SQL Server) | `live_characters` |

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

## 2) Credenciales SQL Server en `.env.local`

Añade un usuario SQL de **solo lectura** sobre `gamedb` (no uses `sa` en
producción si puedes evitarlo). El servidor de este equipo es la instancia
nombrada `DESKTOP-ERMNM26\TOPSERVER`:

```
BRIDGE_GAMEDB_USER=tu_usuario_lectura
BRIDGE_GAMEDB_PASSWORD=tu_password          # secreto · NO commitear
```

Variables opcionales (con sus valores por defecto):

```
BRIDGE_GAMEDB_HOST=DESKTOP-ERMNM26
BRIDGE_GAMEDB_INSTANCE=TOPSERVER    # vacío = instancia por defecto
BRIDGE_GAMEDB_PORT=                 # omitir si se usa instancia nombrada
BRIDGE_GAMEDB_DATABASE=gamedb
BRIDGE_CHAR_INTERVAL_MS=60000       # frecuencia de re-sync en modo bucle
```

## 3) Ejecutar

```bash
# Sincronizar una sola vez
npm run bridge:characters

# Sincronizar en bucle (cada BRIDGE_CHAR_INTERVAL_MS)
npm run bridge:characters:watch
```

## Cómo funciona

1. Conecta a SQL Server con el driver `mssql` (`encrypt: false`,
   `trustServerCertificate: true`, instancia nombrada).
2. Hace un único `SELECT ... WITH (NOLOCK)` sobre `dbo.[character]` con `LEFT
   JOIN dbo.[guild]` para el nombre del clan.
3. Mapea `faction` (0–5) a su nombre legible (debe coincidir con
   `faction_system.lua` `FACTION_NAMES`).
4. Hace `upsert` en `live_characters` por `cha_id` en lotes de 500.

## Seguridad

- El puente **solo hace SELECT** contra el juego; nunca `INSERT`/`UPDATE`/`DELETE`.
- Usa un usuario SQL de solo lectura.
- La tabla pública omite el oro y cualquier dato de cuenta.
