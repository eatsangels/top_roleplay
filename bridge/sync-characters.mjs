// ============================================================
// TOP ROLEPLAY · Fase 10 · Puente de Personajes en vivo
// ------------------------------------------------------------
// Lee gamedb.dbo.character del GameServer en SQL Server (SOLO LECTURA,
// nunca escribe en la base del juego) y vuelca los datos de ROL a Supabase
// (tabla live_characters): faccion, rango, reputacion, wanted y contadores.
// NO publica oro ni datos privados de la cuenta.
//
// Uso:
//   node --env-file=.env.local bridge/sync-characters.mjs --once
//   node --env-file=.env.local bridge/sync-characters.mjs            (bucle)
//
// Variables de entorno (en .env.local de la raiz del proyecto):
//   NEXT_PUBLIC_SUPABASE_URL        (ya existe)
//   SUPABASE_SERVICE_ROLE_KEY       (ya existe)
//   BRIDGE_GAMEDB_HOST              host SQL Server (def. DESKTOP-ERMNM26)
//   BRIDGE_GAMEDB_INSTANCE          instancia nombrada (def. TOPSERVER; vacio = default)
//   BRIDGE_GAMEDB_PORT             (opcional; omitir si se usa instancia nombrada)
//   BRIDGE_GAMEDB_DATABASE         (def. gamedb)
//   BRIDGE_GAMEDB_USER             usuario SQL (p.ej. sa)
//   BRIDGE_GAMEDB_PASSWORD         password SQL  <-- secreto, NO commitear
//   BRIDGE_CHAR_INTERVAL_MS        (opcional, def. 60000)
// ============================================================

import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import sql from "mssql";

// ---------- Config ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INTERVAL_MS = Number(process.env.BRIDGE_CHAR_INTERVAL_MS || 60000);
const ONCE = process.argv.includes("--once");

const GAMEDB_HOST = process.env.BRIDGE_GAMEDB_HOST || "DESKTOP-ERMNM26";
const GAMEDB_INSTANCE =
  process.env.BRIDGE_GAMEDB_INSTANCE !== undefined ? process.env.BRIDGE_GAMEDB_INSTANCE : "TOPSERVER";
const GAMEDB_PORT = process.env.BRIDGE_GAMEDB_PORT ? Number(process.env.BRIDGE_GAMEDB_PORT) : undefined;
const GAMEDB_DATABASE = process.env.BRIDGE_GAMEDB_DATABASE || "gamedb";
const GAMEDB_USER = process.env.BRIDGE_GAMEDB_USER;
const GAMEDB_PASSWORD = process.env.BRIDGE_GAMEDB_PASSWORD;

// faction id -> nombre (debe coincidir con faction_system.lua FACTION_NAMES).
const FACTION_NAMES = {
  0: "Civil",
  1: "Argent Police Force",
  2: "Sea Shadow Syndicate",
  3: "Abyssal Reavers",
  4: "Crimson Tide Outlaws",
  5: "Iron Skull Brotherhood",
};

// ============================================================
// Lee los personajes de SQL Server (SOLO SELECT, WITH (NOLOCK)).
// ============================================================
function buildMssqlConfig() {
  const options = { trustServerCertificate: true, encrypt: false };
  if (GAMEDB_INSTANCE) options.instanceName = GAMEDB_INSTANCE;
  const config = {
    server: GAMEDB_HOST,
    database: GAMEDB_DATABASE,
    user: GAMEDB_USER,
    password: GAMEDB_PASSWORD,
    options,
    pool: { max: 4, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 15000,
    requestTimeout: 30000,
  };
  if (GAMEDB_PORT) config.port = GAMEDB_PORT;
  return config;
}

const SELECT_SQL = `
  SELECT
    c.cha_id            AS cha_id,
    c.cha_name          AS cha_name,
    c.faction           AS faction,
    c.faction_rank      AS faction_rank,
    c.reputation_points AS reputation_points,
    c.wanted_level      AS wanted_level,
    c.total_arrests     AS total_arrests,
    c.total_kills       AS total_kills,
    c.total_deaths      AS total_deaths,
    g.guild_name        AS guild_name
  FROM dbo.[character] c WITH (NOLOCK)
  LEFT JOIN dbo.[guild] g WITH (NOLOCK) ON g.guild_id = c.guild_id
  WHERE c.cha_name IS NOT NULL AND LTRIM(RTRIM(c.cha_name)) <> ''
`;

async function readCharacters(pool) {
  const result = await pool.request().query(SELECT_SQL);
  const now = new Date().toISOString();
  return (result.recordset || [])
    .filter((r) => r.cha_id != null)
    .map((r) => {
      const faction = Number(r.faction || 0);
      return {
        cha_id: Number(r.cha_id),
        cha_name: String(r.cha_name),
        faction,
        faction_name: FACTION_NAMES[faction] || "Desconocido",
        faction_rank: Number(r.faction_rank || 0),
        reputation_points: Number(r.reputation_points || 0),
        wanted_level: Number(r.wanted_level || 0),
        total_arrests: Number(r.total_arrests || 0),
        total_kills: Number(r.total_kills || 0),
        total_deaths: Number(r.total_deaths || 0),
        guild_name: r.guild_name ? String(r.guild_name) : null,
        synced_at: now,
      };
    });
}

// ============================================================
// Sync a Supabase (upsert por cha_id; tolera lotes grandes).
// ============================================================
async function syncOnce(db, pool) {
  const rows = await readCharacters(pool);

  if (rows.length) {
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const slice = rows.slice(i, i + CHUNK);
      const up = await db.from("live_characters").upsert(slice, { onConflict: "cha_id" });
      if (up.error) throw new Error(`upsert live_characters: ${up.error.message}`);
    }
  }

  const wanted = rows.filter((r) => r.wanted_level >= 1).length;
  const stamp = new Date().toLocaleTimeString("es-ES");
  console.log(`[${stamp}] OK · ${rows.length} personajes sincronizados · ${wanted} en busqueda`);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      "ERROR: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Ejecuta con: node --env-file=.env.local bridge/sync-characters.mjs"
    );
    process.exit(1);
  }
  if (!GAMEDB_USER || !GAMEDB_PASSWORD) {
    console.error(
      "ERROR: faltan BRIDGE_GAMEDB_USER / BRIDGE_GAMEDB_PASSWORD en .env.local (credenciales SQL Server de solo lectura)."
    );
    process.exit(1);
  }

  const target = GAMEDB_INSTANCE ? `${GAMEDB_HOST}\\${GAMEDB_INSTANCE}` : GAMEDB_HOST;
  console.log(`Puente de personajes · SQL Server: ${target} · db: ${GAMEDB_DATABASE}`);

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let pool;
  try {
    pool = await new sql.ConnectionPool(buildMssqlConfig()).connect();
  } catch (err) {
    console.error(`[sql] no se pudo conectar a SQL Server: ${err.message}`);
    process.exit(1);
  }

  const run = async () => {
    try {
      await syncOnce(db, pool);
    } catch (err) {
      console.error(`[sync] ${err.message}`);
    }
  };

  await run();

  if (ONCE) {
    await pool.close();
    return;
  }

  console.log(`Modo bucle: re-sincronizando cada ${Math.round(INTERVAL_MS / 1000)}s. Ctrl+C para salir.`);
  setInterval(run, INTERVAL_MS);
}

export { FACTION_NAMES, buildMssqlConfig, readCharacters };

// Ejecutar el puente solo si se invoca directamente (no al importarlo en tests).
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main();
}
