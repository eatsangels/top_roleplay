// Prueba rapida del parser contra ranking_data.lua real (no toca Supabase).
// Uso: node bridge/_test-parse.mjs
import { readFile } from "node:fs/promises";
import { parseLuaAssignment, buildRows, buildSeasonMeta } from "./sync-ranking.mjs";

const PATH =
  process.env.BRIDGE_RANKING_DATA_PATH ||
  "C:\\Users\\EaTsAngels\\Documents\\tales nuevo proyecto\\Server File + SRC\\Server File + SRC\\Files Corsair 2026\\4-GameServer\\resource\\script\\calculate\\ranking_data.lua";

const raw = await readFile(PATH, "utf8");
const ranking = parseLuaAssignment(raw);
console.log("== Parsed RANKING ==");
console.log(JSON.stringify(ranking, null, 2));
console.log("\n== Rows (live_rankings) ==");
console.log(JSON.stringify(buildRows(ranking), null, 2));
console.log("\n== Season meta (live_season) ==");
console.log(JSON.stringify(buildSeasonMeta(ranking), null, 2));
