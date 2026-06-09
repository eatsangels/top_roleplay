import Link from "next/link";
import { ArrowLeft, Coins, Crown, Flame, Gem, Medal, Shield, ShieldHalf, Sparkles, Star, Trophy } from "lucide-react";

import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Ranking en Vivo",
  description:
    "Ranking en vivo de la temporada: arrestos, eliminaciones, contrabando y reputación de TOP ROLEPLAY.",
  alternates: { canonical: "/ranking" },
  openGraph: {
    title: "Ranking en Vivo · TOP ROLEPLAY",
    description:
      "Datos en vivo desde el servidor: arrestos, eliminaciones, contrabando y reputación. La temporada corona a sus campeones.",
    url: "/ranking",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranking en Vivo · TOP ROLEPLAY",
    description: "Arrestos, eliminaciones, contrabando y reputación en vivo de la temporada.",
  },
};

type LiveRow = {
  board: string;
  category: string;
  category_label: string;
  rank: number;
  player_name: string;
  score: number;
  season_id: number;
};

type Champion = { category: string; label: string; name: string; score: number };
type Prestige = { name: string; wins: number };

type SeasonMeta = {
  season_id: number;
  total_days: number;
  days_elapsed: number;
  days_left: number;
  champions: Champion[];
  prestige: Prestige[];
  synced_at: string | null;
};

type CatTheme = {
  key: string;
  label: string;
  icon: typeof Shield;
  accent: string;
  glow: string;
  iconGlow: string;
};

const CATS: CatTheme[] = [
  {
    key: "a",
    label: "Top Arrestos",
    icon: Shield,
    accent: "text-cyan-magic",
    glow: "radial-gradient(circle at 50% 0%, rgba(0,229,255,0.16), transparent 60%)",
    iconGlow: "drop-shadow-[0_0_10px_rgba(0,229,255,0.55)]",
  },
  {
    key: "k",
    label: "Top Eliminaciones",
    icon: Flame,
    accent: "text-red-300",
    glow: "radial-gradient(circle at 50% 0%, rgba(176,0,32,0.22), transparent 60%)",
    iconGlow: "drop-shadow-[0_0_10px_rgba(248,113,113,0.55)]",
  },
  {
    key: "s",
    label: "Top Contrabando",
    icon: Coins,
    accent: "text-gold-300",
    glow: "radial-gradient(circle at 50% 0%, rgba(255,215,0,0.16), transparent 60%)",
    iconGlow: "drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]",
  },
  {
    key: "r",
    label: "Top Reputación",
    icon: Star,
    accent: "text-gold-400",
    glow: "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.16), transparent 60%)",
    iconGlow: "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  },
];

const numberFormat = new Intl.NumberFormat("es-ES");

async function getLiveRanking() {
  try {
    const db = await createSupabaseServerClient();
    const [rowsResult, seasonResult] = await Promise.all([
      db.from("live_rankings").select("*").order("category").order("rank"),
      db.from("live_season").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (rowsResult.error || seasonResult.error) return { rows: [] as LiveRow[], season: null, available: false };

    const season = seasonResult.data
      ? {
          season_id: Number(seasonResult.data.season_id ?? 1),
          total_days: Number(seasonResult.data.total_days ?? 30),
          days_elapsed: Number(seasonResult.data.days_elapsed ?? 0),
          days_left: Number(seasonResult.data.days_left ?? 30),
          champions: Array.isArray(seasonResult.data.champions) ? (seasonResult.data.champions as Champion[]) : [],
          prestige: Array.isArray(seasonResult.data.prestige) ? (seasonResult.data.prestige as Prestige[]) : [],
          synced_at: seasonResult.data.synced_at ?? null,
        }
      : null;

    return { rows: (rowsResult.data ?? []) as LiveRow[], season: season as SeasonMeta | null, available: true };
  } catch {
    return { rows: [] as LiveRow[], season: null, available: false };
  }
}

/* ---------- Presentational helpers ---------- */

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
  note,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Trophy;
  note?: string;
}) {
  return (
    <div className="mb-8">
      <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-cyan-magic">
        <Icon aria-hidden="true" className="text-cyan-magic" size={15} />
        {eyebrow}
      </p>
      <h2 className="font-fantasy text-2xl font-black text-white drop-shadow-[0_0_22px_rgba(212,175,55,0.18)] md:text-4xl">
        {title}
      </h2>
      {note ? <p className="mt-2 text-sm leading-6 text-neutral-400">{note}</p> : null}
    </div>
  );
}

const PODIUM = {
  1: { ring: "ring-gold-300/55 bg-gold-300/15 text-gold-300 shadow-[0_0_18px_rgba(255,215,0,0.3)]", label: "text-white" },
  2: { ring: "ring-zinc-200/40 bg-zinc-300/12 text-zinc-100", label: "text-neutral-100" },
  3: { ring: "ring-orange-300/40 bg-orange-500/12 text-orange-200", label: "text-neutral-100" },
} as const;

function rankStyle(rank: number) {
  if (rank === 1) return PODIUM[1];
  if (rank === 2) return PODIUM[2];
  if (rank === 3) return PODIUM[3];
  return { ring: "ring-white/10 bg-white/5 text-neutral-400", label: "text-neutral-200" };
}

function BoardCard({ cat, entries }: { cat: CatTheme; entries: LiveRow[] }) {
  const Icon = cat.icon;
  return (
    <div className="neon-border city-panel district-glow relative overflow-hidden rounded-3xl p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: cat.glow }} />
      <div className="relative">
        <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-black/50">
            <Icon aria-hidden="true" className={`${cat.accent} ${cat.iconGlow}`} size={20} />
          </span>
          <h3 className={`font-fantasy text-lg font-black tracking-wide ${cat.accent}`}>{cat.label}</h3>
        </div>
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="tr-pulse grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/50">
              <Icon aria-hidden="true" className={`${cat.accent} ${cat.iconGlow} opacity-70`} size={20} />
            </span>
            <p className="text-sm text-neutral-500">Sin registros aún</p>
          </div>
        ) : (
          <ol className="space-y-2.5">
            {entries.map((entry) => {
              const style = rankStyle(entry.rank);
              return (
                <li
                  key={`${entry.category}-${entry.rank}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition duration-300 hover:translate-x-0.5 hover:bg-white/[0.04]"
                >
                  <span
                    className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black tabular-nums ring-1 ${style.ring}`}
                  >
                    {entry.rank === 1 ? (
                      <Crown aria-hidden="true" className="text-gold-300" size={15} />
                    ) : (
                      entry.rank
                    )}
                  </span>
                  <span className={`flex-1 truncate text-sm font-bold ${style.label}`}>{entry.player_name}</span>
                  <span className={`text-sm font-black tabular-nums ${cat.accent}`}>{numberFormat.format(entry.score)}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

function BoardGrid({ rows, board }: { rows: LiveRow[]; board: string }) {
  const data = rows.filter((row) => row.board === board);
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {CATS.map((cat) => {
        const entries = data.filter((row) => row.category === cat.key).sort((a, b) => a.rank - b.rank);
        return <BoardCard cat={cat} entries={entries} key={cat.key} />;
      })}
    </div>
  );
}

const champIconFor: Record<string, typeof Crown> = {
  a: Shield,
  k: Flame,
  s: Coins,
  r: Star,
};

/* ---------- Page ---------- */

export default async function RankingPage() {
  const { rows, season, available } = await getLiveRanking();
  const hasSeasonData = rows.some((row) => row.board === "season");
  const progress =
    season && season.total_days > 0
      ? Math.min(100, Math.round((season.days_elapsed / season.total_days) * 100))
      : 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-foreground">
      {/* Backdrop layers mirroring the landing */}
      <div aria-hidden="true" className="city-grid pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div aria-hidden="true" className="smoke-texture pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Hero */}
        <header className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-magic/35 bg-cyan-magic/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-magic shadow-[0_0_34px_rgba(0,229,255,0.14)]">
            <Sparkles aria-hidden="true" size={15} />
            TOP ROLEPLAY · Cops vs Gangs
          </div>
          <h1 className="font-fantasy text-4xl font-black leading-none text-white drop-shadow-[0_0_34px_rgba(176,0,32,0.55)] sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-b from-white via-gold-300 to-gold-500 bg-clip-text text-transparent">
              Ranking en Vivo
            </span>
            <span className="mt-2 block font-fantasy text-xl font-black tracking-[0.18em] text-gold-300 sm:text-2xl">
              Temporada {season?.season_id ?? 1}
            </span>
          </h1>
          <div className="mx-auto my-6 h-px w-40 bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
          <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
            Datos en vivo desde el servidor: arrestos, eliminaciones, contrabando y reputación. La temporada cierra
            automáticamente y corona a sus campeones.
          </p>
        </header>

        {!available && (
          <div className="neon-border city-panel mx-auto mb-10 max-w-xl rounded-2xl p-5 text-center text-sm text-gold-300">
            El ranking en vivo aún no está disponible. Ejecuta el puente de sincronización para llenar los datos.
          </div>
        )}

        {/* Season progress */}
        {season && (
          <div className="neon-border city-panel district-glow mb-12 rounded-3xl p-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 font-bold text-white">
                <Trophy aria-hidden="true" className="text-gold-300" size={16} />
                Día {season.days_elapsed} de {season.total_days}
              </span>
              <span className="font-black uppercase tracking-wider text-cyan-magic">Quedan ~{season.days_left} días</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full border border-white/10 bg-black/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-magic via-gold-300 to-crimson shadow-[0_0_18px_rgba(255,215,0,0.35)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Temporada actual */}
        <section className="mb-16">
          <SectionHeader eyebrow="En curso" icon={Trophy} title="Temporada actual" />
          {hasSeasonData ? (
            <BoardGrid board="season" rows={rows} />
          ) : (
            <div className="neon-border city-panel district-glow relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,215,0,0.12), transparent 60%)" }}
              />
              <div className="relative">
                <span className="tr-pulse mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-gold-300/25 bg-black/50">
                  <Sparkles aria-hidden="true" className="text-gold-300 drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]" size={30} />
                </span>
                <h3 className="font-fantasy text-2xl font-black text-white md:text-3xl">La temporada acaba de empezar</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-300">
                  Los primeros arrestos, eliminaciones, cargamentos y reputación aparecerán aquí en cuanto ocurran en el
                  juego. La ciudad espera a sus primeras leyendas.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  {CATS.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <span
                        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-black uppercase tracking-wider text-neutral-300 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/25 hover:text-neutral-100"
                        key={cat.key}
                      >
                        <Icon aria-hidden="true" className={`${cat.accent} ${cat.iconGlow}`} size={14} />
                        {cat.label.replace("Top ", "")}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Salón de la Fama */}
        {season && season.champions.length > 0 && (
          <>
            <div aria-hidden="true" className="gold-divider mb-16" />
            <section className="mb-16">
              <SectionHeader
                eyebrow="Leyendas"
                icon={Crown}
                note="Campeones coronados en la última temporada cerrada."
                title="Salón de la Fama"
              />
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                {season.champions.map((champ) => {
                  const ChampIcon = champIconFor[champ.category] ?? Trophy;
                  return (
                    <div
                      className="neon-border city-panel district-glow group relative overflow-hidden rounded-3xl p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-gold-300/30"
                      key={champ.category}
                    >
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0"
                        style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,215,0,0.18), transparent 62%)" }}
                      />
                      <div className="relative">
                        <span className="relative mx-auto mb-4 grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-gold-300/30 bg-black/50">
                          <span aria-hidden="true" className="tr-shimmer pointer-events-none absolute inset-0" />
                          <Crown aria-hidden="true" className="relative text-gold-300 drop-shadow-[0_0_12px_rgba(255,215,0,0.6)] transition duration-300 group-hover:scale-110" size={26} />
                        </span>
                        <p className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-[0.18em] text-gold-300/85">
                          <ChampIcon aria-hidden="true" size={13} />
                          {champ.label}
                        </p>
                        <p className="mt-3 font-fantasy text-2xl font-black text-white">{champ.name}</p>
                        <p className="mt-2 text-sm font-bold tabular-nums text-neutral-400">
                          {numberFormat.format(champ.score)} pts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* Prestigio */}
        {season && season.prestige.length > 0 && (
          <>
            <div aria-hidden="true" className="gold-divider mb-16" />
            <section className="mb-16">
              <SectionHeader
                eyebrow="Honores"
                icon={ShieldHalf}
                note="Títulos de temporada acumulados por los veteranos."
                title="Prestigio"
              />
              <div className="flex flex-wrap gap-3">
                {season.prestige.map((p) => (
                  <div
                    className="neon-border city-panel flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/25"
                    key={p.name}
                  >
                    <Medal aria-hidden="true" className="text-gold-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]" size={16} />
                    <span className="font-bold text-white">{p.name}</span>
                    <span className="font-black tabular-nums text-cyan-magic">×{p.wins}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Weekly + Daily */}
        <div aria-hidden="true" className="gold-divider mb-16" />
        <section className="mb-16">
          <SectionHeader eyebrow="Últimos 7 días" icon={Gem} title="Tablero semanal" />
          <BoardGrid board="weekly" rows={rows} />
        </section>

        <section className="mb-16">
          <SectionHeader eyebrow="Hoy" icon={Flame} title="Tablero diario" />
          <BoardGrid board="daily" rows={rows} />
        </section>

        {/* Footer */}
        <footer className="border-t border-gold-300/15 pt-8 text-center text-xs text-neutral-500">
          {season?.synced_at ? (
            <p>Actualizado: {new Date(season.synced_at).toLocaleString("es-ES")}</p>
          ) : (
            <p>Ranking en vivo de TOP ROLEPLAY</p>
          )}
          <Link
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-300/25 px-5 py-2.5 font-bold uppercase tracking-wider text-gold-300 transition hover:bg-gold-300/10 hover:text-gold-50"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={15} />
            Volver al inicio
          </Link>
        </footer>
      </div>
    </main>
  );
}
