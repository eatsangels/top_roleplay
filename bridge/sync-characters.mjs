// ============================================================
// TOP ROLEPLAY · Fase 10 · Puente de Personajes en vivo
// ------------------------------------------------------------
// Lee gamedb.dbo.character del GameServer en SQL Server (SOLO LECTURA,
// nunca escribe en la base del juego) y vuelca los datos de ROL a Supabase
// (tabla live_characters): faccion, rango, reputacion, wanted y contadores.
// NO publica oro ni datos privados de la cuenta.
//
// IMPORTANTE — transporte: el TCP/IP de esta instancia de SQL Server rechaza el
// handshake de pre-login (falla incluso con .NET), pero la MEMORIA COMPARTIDA
// local funciona (igual que el juego). Como este puente corre en la MISMA
// maquina que el SQL Server, consultamos por memoria compartida lanzando una
// consulta local con PowerShell + System.Data.SqlClient (Server=.\TOPSERVER).
// No se usa TCP, asi que no depende del SQL Browser ni del puerto dinamico.
//
// Uso:
//   node --env-file=.env.local bridge/sync-characters.mjs --once
//   node --env-file=.env.local bridge/sync-characters.mjs            (bucle)
//
// Variables de entorno (en .env.local de la raiz del proyecto):
//   NEXT_PUBLIC_SUPABASE_URL        (ya existe)
//   SUPABASE_SERVICE_ROLE_KEY       (ya existe)
//   BRIDGE_GAMEDB_LOCAL_SERVER      destino local (def. .\TOPSERVER)
//   BRIDGE_GAMEDB_DATABASE          base del juego (def. gamedb)
//   BRIDGE_GAMEDB_USER              usuario SQL (necesita SELECT en character/guild)
//   BRIDGE_GAMEDB_PASSWORD          password SQL  <-- secreto, NO commitear
//   BRIDGE_CHAR_INTERVAL_MS         (opcional, def. 60000)
// ============================================================

import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

// ---------- Config ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INTERVAL_MS = Number(process.env.BRIDGE_CHAR_INTERVAL_MS || 60000);
const ONCE = process.argv.includes("--once");

const LOCAL_SERVER = process.env.BRIDGE_GAMEDB_LOCAL_SERVER || ".\\TOPSERVER";
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
// Lee los personajes por MEMORIA COMPARTIDA (PowerShell).
// La consulta es SOLO SELECT, con WITH (NOLOCK). Devuelve las filas como JSON
// por stdout. La contrasena se pasa al hijo por variable de entorno (no por
// argv) para que no aparezca en la lista de procesos.
// ============================================================
const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
$cs = "Server=$($env:SM_SERVER);Database=$($env:SM_DB);User Id=$($env:SM_USER);Password=$($env:SM_PASS);TrustServerCertificate=True;Connect Timeout=15"
$query = @"
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
"@
$c = New-Object System.Data.SqlClient.SqlConnection $cs
$c.Open()
$cmd = $c.CreateCommand()
$cmd.CommandText = $query
$reader = $cmd.ExecuteReader()
$rows = New-Object System.Collections.Generic.List[object]
while ($reader.Read()) {
  $o = [ordered]@{
    cha_id            = $reader["cha_id"]
    cha_name          = $reader["cha_name"]
    faction           = $reader["faction"]
    faction_rank      = $reader["faction_rank"]
    reputation_points = $reader["reputation_points"]
    wanted_level      = $reader["wanted_level"]
    total_arrests     = $reader["total_arrests"]
    total_kills       = $reader["total_kills"]
    total_deaths      = $reader["total_deaths"]
    guild_name        = if ($reader["guild_name"] -is [DBNull]) { $null } else { $reader["guild_name"] }
  }
  $rows.Add([pscustomobject]$o)
}
$reader.Close()
$c.Close()
if ($rows.Count -eq 0) {
  [Console]::Out.Write("[]")
} else {
  $json = ConvertTo-Json -InputObject $rows -Depth 3 -Compress
  if ($rows.Count -eq 1) { $json = "[$json]" }
  [Console]::Out.Write($json)
}
`;

function readCharactersRaw() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", PS_SCRIPT],
      {
        env: {
          ...process.env,
          SM_SERVER: LOCAL_SERVER,
          SM_DB: GAMEDB_DATABASE,
          SM_USER: GAMEDB_USER,
          SM_PASS: GAMEDB_PASSWORD,
        },
        windowsHide: true,
        maxBuffer: 64 * 1024 * 1024,
      }
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => reject(e));
    child.on("close", (code) => {
      if (code !== 0) {
        const msg = (err.trim().split(/\r?\n/)[0] || `powershell salio con codigo ${code}`).trim();
        return reject(new Error(msg));
      }
      try {
        const parsed = JSON.parse(String(out).trim() || "[]");
        resolve(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (e) {
        reject(new Error(`no se pudo parsear la salida de PowerShell: ${e.message}`));
      }
    });
  });
}

async function readCharacters() {
  const raw = await readCharactersRaw();
  const now = new Date().toISOString();
  return raw
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
async function syncOnce(db) {
  const rows = await readCharacters();

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

  console.log(`Puente de personajes · SQL Server (memoria compartida): ${LOCAL_SERVER} · db: ${GAMEDB_DATABASE}`);

  const db = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const run = async () => {
    try {
      await syncOnce(db);
    } catch (err) {
      console.error(`[sync] ${err.message}`);
    }
  };

  await run();

  if (ONCE) return;

  console.log(`Modo bucle: re-sincronizando cada ${Math.round(INTERVAL_MS / 1000)}s. Ctrl+C para salir.`);
  setInterval(run, INTERVAL_MS);
}

export { FACTION_NAMES, readCharacters };

// Ejecutar el puente solo si se invoca directamente (no al importarlo en tests).
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main();
}
