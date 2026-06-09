// ============================================================
// TOP ROLEPLAY · Fase 10 · Puente de Jugadores en linea
// ------------------------------------------------------------
// Lee AccountServer.dbo.account_login del servidor en SQL Server (SOLO LECTURA,
// nunca escribe en la base del juego) y vuelca a Supabase (tabla
// live_server_status) el numero real de jugadores conectados.
//
// IMPORTANTE — transporte: el TCP/IP de esta instancia de SQL Server rechaza el
// handshake de pre-login (falla incluso con .NET), pero la MEMORIA COMPARTIDA
// local funciona (igual que el juego). Como este puente corre en la MISMA
// maquina que el SQL Server, consultamos por memoria compartida lanzando una
// consulta local con PowerShell + System.Data.SqlClient (Server=.\TOPSERVER).
// No se usa TCP, asi que no depende del SQL Browser ni del puerto dinamico.
//
// El motor marca login_status <> 0 cuando una cuenta esta en linea (lo pone
// AccountServer/GateServer al entrar y lo limpia al salir). Nota: si un
// GameServer cae sin logout limpio, ese valor puede quedar "pegado" en online.
//
// Uso:
//   node --env-file=.env.local bridge/sync-online.mjs --once
//   node --env-file=.env.local bridge/sync-online.mjs            (bucle)
//
// Variables de entorno (en .env.local de la raiz del proyecto):
//   NEXT_PUBLIC_SUPABASE_URL        (ya existe)
//   SUPABASE_SERVICE_ROLE_KEY       (ya existe)
//   BRIDGE_GAMEDB_LOCAL_SERVER      destino local (def. .\TOPSERVER)
//   BRIDGE_ACCOUNTDB_DATABASE       base de cuentas (def. AccountServer)
//   BRIDGE_GAMEDB_USER              usuario SQL (necesita SELECT en account_login)
//   BRIDGE_GAMEDB_PASSWORD          password SQL  <-- secreto, NO commitear
//   BRIDGE_ONLINE_INTERVAL_MS       (opcional, def. 30000)
// ============================================================

import { pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import { createClient } from "@supabase/supabase-js";

// ---------- Config ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const INTERVAL_MS = Number(process.env.BRIDGE_ONLINE_INTERVAL_MS || 30000);
const ONCE = process.argv.includes("--once");

const LOCAL_SERVER = process.env.BRIDGE_GAMEDB_LOCAL_SERVER || ".\\TOPSERVER";
const ACCOUNTDB_DATABASE = process.env.BRIDGE_ACCOUNTDB_DATABASE || "AccountServer";
const GAMEDB_USER = process.env.BRIDGE_GAMEDB_USER;
const GAMEDB_PASSWORD = process.env.BRIDGE_GAMEDB_PASSWORD;
// Ventana maxima de sesion (horas). login_status se queda "pegado" en online si
// un GameServer cae sin logout limpio; descartamos esas cuentas fantasma exigiendo
// que el ultimo login sea reciente y posterior al ultimo logout. Sube este valor
// si tienes jugadores con sesiones continuas mas largas que el limite.
const ONLINE_MAX_HOURS = Number(process.env.BRIDGE_ONLINE_MAX_HOURS || 24);

// Memoria del pico del dia (se reinicia al cambiar de fecha local).
let peakToday = 0;
let peakDate = new Date().toLocaleDateString("es-ES");

// ============================================================
// Lee el conteo de jugadores en linea por MEMORIA COMPARTIDA (PowerShell).
// La contraseña se pasa al hijo por variable de entorno (no por argv) para
// que no aparezca en la lista de procesos.
// ============================================================
const PS_SCRIPT = `
$ErrorActionPreference = 'Stop'
$cs = "Server=$($env:SM_SERVER);Database=$($env:SM_DB);User Id=$($env:SM_USER);Password=$($env:SM_PASS);TrustServerCertificate=True;Connect Timeout=10"
$c = New-Object System.Data.SqlClient.SqlConnection $cs
$c.Open()
$cmd = $c.CreateCommand()
$cmd.CommandText = "SELECT COUNT(*) FROM dbo.account_login WITH (NOLOCK) WHERE login_status <> 0 AND last_login_time > last_logout_time AND last_login_time >= DATEADD(hour, -${ONLINE_MAX_HOURS}, GETDATE())"
$n = $cmd.ExecuteScalar()
$c.Close()
[Console]::Out.Write([string]$n)
`;

function readOnlineCount() {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", PS_SCRIPT],
      {
        env: {
          ...process.env,
          SM_SERVER: LOCAL_SERVER,
          SM_DB: ACCOUNTDB_DATABASE,
          SM_USER: GAMEDB_USER,
          SM_PASS: GAMEDB_PASSWORD,
        },
        windowsHide: true,
      }
    );
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d.toString()));
    child.stderr.on("data", (d) => (err += d.toString()));
    child.on("error", (e) => reject(e));
    child.on("close", (code) => {
      const n = parseInt(String(out).trim(), 10);
      if (code === 0 && Number.isFinite(n)) {
        resolve(n);
      } else {
        const msg = (err.trim().split(/\r?\n/)[0] || `powershell salio con codigo ${code}`).trim();
        reject(new Error(msg));
      }
    });
  });
}

// ============================================================
// Sync a Supabase (upsert de la fila unica id = 1).
// ============================================================
async function syncOnce(db) {
  const online = await readOnlineCount();

  // Mantiene el pico del dia local en memoria.
  const today = new Date().toLocaleDateString("es-ES");
  if (today !== peakDate) {
    peakDate = today;
    peakToday = 0;
  }
  if (online > peakToday) peakToday = online;

  const up = await db.from("live_server_status").upsert(
    {
      id: 1,
      online_count: online,
      peak_today: peakToday,
      is_online: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (up.error) throw new Error(`upsert live_server_status: ${up.error.message}`);

  const stamp = new Date().toLocaleTimeString("es-ES");
  console.log(`[${stamp}] OK · ${online} jugadores en linea · pico hoy ${peakToday}`);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      "ERROR: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Ejecuta con: node --env-file=.env.local bridge/sync-online.mjs"
    );
    process.exit(1);
  }
  if (!GAMEDB_USER || !GAMEDB_PASSWORD) {
    console.error(
      "ERROR: faltan BRIDGE_GAMEDB_USER / BRIDGE_GAMEDB_PASSWORD en .env.local (credenciales SQL Server de solo lectura)."
    );
    process.exit(1);
  }

  console.log(`Puente de jugadores en linea · SQL Server (memoria compartida): ${LOCAL_SERVER} · db: ${ACCOUNTDB_DATABASE}`);

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

export { readOnlineCount };

// Ejecutar el puente solo si se invoca directamente (no al importarlo en tests).
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main();
}
