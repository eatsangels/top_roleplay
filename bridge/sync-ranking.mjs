// ============================================================
// TOP ROLEPLAY · Fase 10 · Puente de Ranking en vivo
// ------------------------------------------------------------
// Lee resource/script/calculate/ranking_data.lua del GameServer
// (SOLO LECTURA, nunca escribe en el servidor de juego) y vuelca el
// ranking a Supabase (tablas live_rankings + live_season).
//
// Uso:
//   node --env-file=.env.local bridge/sync-ranking.mjs --once
//   node --env-file=.env.local bridge/sync-ranking.mjs            (bucle)
//
// Variables de entorno (en .env.local de la raiz del proyecto):
//   NEXT_PUBLIC_SUPABASE_URL       (ya existe)
//   SUPABASE_SERVICE_ROLE_KEY      (ya existe)
//   BRIDGE_RANKING_DATA_PATH       ruta absoluta a ranking_data.lua
//   BRIDGE_SEASON_DAYS             (opcional, def. 30)
//   BRIDGE_TOP_N                   (opcional, def. 10)
//   BRIDGE_INTERVAL_MS             (opcional, def. 60000)
// ============================================================

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";

// ---------- Config ----------
const DEFAULT_RANKING_PATH =
  "C:\\Users\\EaTsAngels\\Documents\\tales nuevo proyecto\\Server File + SRC\\Server File + SRC\\Files Corsair 2026\\4-GameServer\\resource\\script\\calculate\\ranking_data.lua";

const RANKING_PATH = process.env.BRIDGE_RANKING_DATA_PATH || DEFAULT_RANKING_PATH;
const SEASON_DAYS = Number(process.env.BRIDGE_SEASON_DAYS || 30);
const TOP_N = Number(process.env.BRIDGE_TOP_N || 10);
const INTERVAL_MS = Number(process.env.BRIDGE_INTERVAL_MS || 60000);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ONCE = process.argv.includes("--once");

const CATS = [
  { key: "a", label: "Top Arrestos" },
  { key: "k", label: "Top Eliminaciones" },
  { key: "s", label: "Top Contrabando" },
  { key: "r", label: "Top Reputación" },
];
const BOARDS = ["season", "weekly", "daily"];

// ============================================================
// Parser minimal de la tabla Lua que genera ranking_system.lua.
// Formato (string.format "%q" para strings, numeros desnudos, tablas
// {["clave"]=valor,...}). No usa eval; tokeniza el literal.
// ============================================================
function parseLuaAssignment(src) {
  const start = src.indexOf("{");
  if (start === -1) return {};
  let pos = start;

  const isWs = (c) => c === " " || c === "\t" || c === "\r" || c === "\n";
  const skipWs = () => { while (pos < src.length && isWs(src[pos])) pos++; };

  function parseString() {
    pos++; // abre "
    let out = "";
    while (pos < src.length) {
      const ch = src[pos++];
      if (ch === "\\") {
        const n = src[pos++];
        if (n === "n") out += "\n";
        else if (n === "t") out += "\t";
        else if (n === "r") out += "\r";
        else out += n; // \"  \\  y otros
      } else if (ch === '"') {
        break;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function parseScalar() {
    const begin = pos;
    while (pos < src.length && !",}]".includes(src[pos])) pos++;
    const raw = src.slice(begin, pos).trim();
    if (raw === "true") return true;
    if (raw === "false") return false;
    if (raw === "nil") return null;
    const num = Number(raw);
    return Number.isNaN(num) ? raw : num;
  }

  function parseValue() {
    skipWs();
    if (src[pos] === "{") return parseTable();
    if (src[pos] === '"') return parseString();
    return parseScalar();
  }

  function parseKey() {
    skipWs();
    if (src[pos] !== "[") return null;
    pos++; // [
    skipWs();
    const key = src[pos] === '"' ? parseString() : parseScalar();
    skipWs();
    if (src[pos] === "]") pos++;
    return key;
  }

  function parseTable() {
    pos++; // {
    const obj = {};
    skipWs();
    while (pos < src.length && src[pos] !== "}") {
      const key = parseKey();
      skipWs();
      if (src[pos] === "=") pos++;
      const val = parseValue();
      if (key !== null) obj[key] = val;
      skipWs();
      if (src[pos] === ",") { pos++; skipWs(); }
    }
    pos++; // }
    return obj;
  }

  return parseTable();
}

// ============================================================
// Transformacion: top-N por categoria en un tablero.
// ============================================================
function topN(board, key) {
  const arr = [];
  for (const [name, rec] of Object.entries(board || {})) {
    if (!rec || typeof rec !== "object") continue;
    const score = Number(rec[key] || 0);
    if (score > 0) arr.push({ name, score });
  }
  arr.sort((x, y) => y.score - x.score);
  return arr.slice(0, TOP_N);
}

function buildRows(ranking) {
  const seasonId = Number(ranking.season_id || 1);
  const rows = [];
  for (const board of BOARDS) {
    const data = ranking[board] || {};
    for (const cat of CATS) {
      const top = topN(data, cat.key);
      top.forEach((entry, index) => {
        rows.push({
          board,
          category: cat.key,
          category_label: cat.label,
          rank: index + 1,
          player_name: entry.name,
          score: entry.score,
          season_id: seasonId,
        });
      });
    }
  }
  return rows;
}

function buildSeasonMeta(ranking) {
  const seasonId = Number(ranking.season_id || 1);
  const start = Number(ranking.season_start || 0);
  const now = Math.floor(Date.now() / 1000);
  const elapsed = start > 0 ? Math.max(0, Math.floor((now - start) / 86400)) : 0;
  const left = Math.max(0, SEASON_DAYS - elapsed);

  // Salon de la Fama: champions = {season_id, a:{name,score}, k:..., s:..., r:...}
  const champions = [];
  const champ = ranking.champions || {};
  for (const cat of CATS) {
    const c = champ[cat.key];
    if (c && c.name) {
      champions.push({ category: cat.key, label: cat.label, name: c.name, score: Number(c.score || 0) });
    }
  }

  // Prestigio: {name: wins}
  const prestige = Object.entries(ranking.prestige || {})
    .map(([name, wins]) => ({ name, wins: Number(wins || 0) }))
    .filter((p) => p.wins > 0)
    .sort((x, y) => y.wins - x.wins)
    .slice(0, 20);

  return {
    id: 1,
    season_id: seasonId,
    season_start: start > 0 ? new Date(start * 1000).toISOString() : null,
    total_days: SEASON_DAYS,
    days_elapsed: elapsed,
    days_left: left,
    champions,
    prestige,
    synced_at: new Date().toISOString(),
    champions_season_id: Number(champ.season_id || 0),
  };
}

// ============================================================
// Sync a Supabase.
// ============================================================
async function syncOnce(db) {
  const raw = await readFile(RANKING_PATH, "utf8");
  const ranking = parseLuaAssignment(raw);
  const rows = buildRows(ranking);
  const meta = buildSeasonMeta(ranking);
  const { champions_season_id, ...seasonRow } = meta;
  void champions_season_id;

  // Reemplazo limpio del tablero (ventana de inconsistencia de milisegundos).
  const del = await db.from("live_rankings").delete().gte("rank", 0);
  if (del.error) throw new Error(`delete live_rankings: ${del.error.message}`);

  if (rows.length) {
    const ins = await db.from("live_rankings").insert(rows);
    if (ins.error) throw new Error(`insert live_rankings: ${ins.error.message}`);
  }

  const up = await db.from("live_season").upsert(seasonRow, { onConflict: "id" });
  if (up.error) throw new Error(`upsert live_season: ${up.error.message}`);

  const stamp = new Date().toLocaleTimeString("es-ES");
  console.log(`[${stamp}] OK · temporada ${meta.season_id} · ${rows.length} filas · ${meta.champions.length} campeones · quedan ~${meta.days_left}d`);
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("ERROR: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Ejecuta con: node --env-file=.env.local bridge/sync-ranking.mjs");
    process.exit(1);
  }
  console.log(`Puente de ranking · archivo: ${RANKING_PATH}`);
  const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

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

export { parseLuaAssignment, buildRows, buildSeasonMeta };

// Ejecutar el puente solo si se invoca directamente (no al importarlo en tests).
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  main();
}
