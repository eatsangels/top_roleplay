# Puente de datos · TOP ROLEPLAY (Fase 10)

Sincroniza datos reales del GameServer (Tales of Pirates / PKO) hacia Supabase
para que la web los muestre en vivo. **Solo lectura del lado del juego**: el
puente nunca escribe ni modifica el servidor; únicamente lee archivos.

## Módulos

| Script | Lee | Escribe en Supabase |
| --- | --- | --- |
| `sync-ranking.mjs` | `ranking_data.lua` (Fase 8) | `live_rankings`, `live_season` |

> Próximos módulos previstos (no incluidos aún): personajes/facciones/wanted
> desde SQL Server (`gamedb.character`), territorios y arrestos.

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
