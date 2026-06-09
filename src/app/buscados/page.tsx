import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Crosshair,
  Crown,
  Medal,
  Scale,
  ShieldHalf,
  Skull,
  Sparkles,
  Star,
  TriangleAlert,
  Users,
} from "lucide-react";

import type { Metadata } from "next";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 30;

export const metadata: Metadata = {
  title: "Más Buscados y Facciones",
  description:
    "Los criminales más buscados de la ciudad y el pulso de cada facción de TOP ROLEPLAY: reputación, arrestos y bajas en vivo desde el servidor.",
  alternates: { canonical: "/buscados" },
  openGraph: {
    title: "Más Buscados · TOP ROLEPLAY",
    description:
      "La lista de los criminales más buscados y el estado de las facciones, en vivo desde el servidor de Cops vs Gangs.",
    url: "/buscados",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Más Buscados · TOP ROLEPLAY",
    description: "Criminales más buscados y facciones en vivo de TOP ROLEPLAY.",
  },
};

type CharRow = {
  cha_id: number;
  cha_name: string;
  faction: number;
  faction_name: string;
  faction_rank: number;
  reputation_points: number;
  wanted_level: number;
  total_arrests: number;
  total_kills: number;
  total_deaths: number;
  guild_name: string | null;
};

type FactionTheme = {
  id: number;
  name: string;
  short: string;
  accent: string;
  chip: string;
  glow: string;
};

const FACTIONS: FactionTheme[] = [
  {
    id: 1,
    name: "Argent Police Force",
    short: "APF",
    accent: "text-cyan-magic",
    chip: "border-cyan-magic/35 bg-cyan-magic/10 text-cyan-magic",
    glow: "radial-gradient(circle at 50% 0%, rgba(0,229,255,0.16), transparent 60%)",
  },
  {
    id: 2,
    name: "Sea Shadow Syndicate",
    short: "Sea Shadow",
    accent: "text-sky-300",
    chip: "border-sky-300/35 bg-sky-300/10 text-sky-200",
    glow: "radial-gradient(circle at 50% 0%, rgba(125,211,252,0.14), transparent 60%)",
  },
  {
    id: 3,
    name: "Abyssal Reavers",
    short: "Abyssal",
    accent: "text-violet-300",
    chip: "border-violet-300/35 bg-violet-300/10 text-violet-200",
    glow: "radial-gradient(circle at 50% 0%, rgba(196,181,253,0.14), transparent 60%)",
  },
  {
    id: 4,
    name: "Crimson Tide Outlaws",
    short: "Crimson Tide",
    accent: "text-red-300",
    chip: "border-red-300/35 bg-red-500/10 text-red-200",
    glow: "radial-gradient(circle at 50% 0%, rgba(252,165,165,0.16), transparent 60%)",
  },
  {
    id: 5,
    name: "Iron Skull Brotherhood",
    short: "Iron Skull",
    accent: "text-amber-300",
    chip: "border-amber-300/35 bg-amber-400/10 text-amber-200",
    glow: "radial-gradient(circle at 50% 0%, rgba(252,211,77,0.14), transparent 60%)",
  },
];

function factionTheme(id: number): FactionTheme {
  return (
    FACTIONS.find((f) => f.id === id) ?? {
      id: 0,
      name: "Civil",
      short: "Civil",
      accent: "text-neutral-300",
      chip: "border-white/15 bg-white/5 text-neutral-300",
      glow: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 60%)",
    }
  );
}

async function getLiveCharacters() {
  try {
    const db = await createSupabaseServerClient();
    const { data, error } = await db
      .from("live_characters")
      .select(
        "cha_id, cha_name, faction, faction_name, faction_rank, reputation_points, wanted_level, total_arrests, total_kills, total_deaths, guild_name"
      );
    if (error) return { rows: [] as CharRow[], available: false };
    return { rows: (data ?? []) as CharRow[], available: true };
  } catch {
    return { rows: [] as CharRow[], available: false };
  }
}

const intFmt = new Intl.NumberFormat("es-ES");

function SectionHeader({
  eyebrow,
  title,
  icon: Icon,
  note,
}: {
  eyebrow: string;
  title: string;
  icon: typeof Skull;
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

const WANTED_STYLE = [
  "border-white/10 bg-white/5 text-neutral-300",
  "border-amber-300/30 bg-amber-400/10 text-amber-200",
  "border-orange-400/35 bg-orange-500/12 text-orange-200",
  "border-red-400/40 bg-red-500/14 text-red-200",
  "border-red-500/55 bg-red-600/18 text-red-100 shadow-[0_0_18px_rgba(220,38,38,0.25)]",
  "border-crimson/70 bg-crimson/25 text-white shadow-[0_0_24px_rgba(176,0,32,0.45)]",
] as const;

function wantedStyle(level: number) {
  return WANTED_STYLE[Math.max(0, Math.min(5, level))];
}

function WantedCard({ row, position }: { row: CharRow; position: number }) {
  const theme = factionTheme(row.faction);
  const top = position === 1;
  return (
    <div
      className={`neon-border city-panel relative overflow-hidden rounded-2xl p-5 transition duration-300 hover:-translate-y-0.5 ${wantedStyle(
        row.wanted_level
      )}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {top ? (
              <Crown aria-hidden="true" className="text-gold-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" size={18} />
            ) : (
              <Skull aria-hidden="true" className="text-red-300" size={16} />
            )}
            <span className="truncate font-fantasy text-lg font-black text-white">{row.cha_name}</span>
          </div>
          <p className="mt-1 truncate text-xs font-black uppercase tracking-wider">
            <span className={theme.accent}>{theme.short}</span>
            {row.guild_name ? <span className="text-neutral-500"> · {row.guild_name}</span> : null}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="flex items-center justify-end gap-1 text-[11px] font-black uppercase tracking-wider text-neutral-400">
            <Crosshair aria-hidden="true" size={12} />
            Búsqueda
          </div>
          <div className="font-fantasy text-2xl font-black leading-none">{row.wanted_level}/5</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
        <Stat label="Arrestos" value={row.total_arrests} />
        <Stat label="Bajas" value={row.total_kills} />
        <Stat label="Reputación" value={row.reputation_points} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 px-2 py-2">
      <div className="font-fantasy text-base font-black text-white">{intFmt.format(value)}</div>
      <div className="mt-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-500">{label}</div>
    </div>
  );
}

function FactionCard({ theme, members }: { theme: FactionTheme; members: CharRow[] }) {
  const totalArrests = members.reduce((a, m) => a + m.total_arrests, 0);
  const totalKills = members.reduce((a, m) => a + m.total_kills, 0);
  const totalRep = members.reduce((a, m) => a + m.reputation_points, 0);
  const top = [...members].sort((a, b) => b.reputation_points - a.reputation_points).slice(0, 3);

  return (
    <div className="neon-border city-panel district-glow relative overflow-hidden rounded-3xl p-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: theme.glow }} />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className={`font-fantasy text-xl font-black ${theme.accent}`}>{theme.name}</h3>
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${theme.chip}`}>
            {members.length} {members.length === 1 ? "miembro" : "miembros"}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
          <Stat label="Arrestos" value={totalArrests} />
          <Stat label="Bajas" value={totalKills} />
          <Stat label="Reputación" value={totalRep} />
        </div>
        {top.length > 0 && (
          <ul className="mt-5 space-y-2">
            {top.map((m, i) => (
              <li
                key={m.cha_id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-white/10 bg-black/60 text-[11px] font-black text-gold-300">
                    {i + 1}
                  </span>
                  <span className="truncate font-bold text-white">{m.cha_name}</span>
                </span>
                <span className="shrink-0 text-xs font-black text-neutral-400">{intFmt.format(m.reputation_points)} rep</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Leaderboard({
  title,
  icon: Icon,
  rows,
  metric,
}: {
  title: string;
  icon: typeof Award;
  rows: CharRow[];
  metric: (r: CharRow) => number;
}) {
  return (
    <div className="neon-border city-panel rounded-3xl p-6">
      <h3 className="mb-4 flex items-center gap-2 font-fantasy text-lg font-black text-white">
        <Icon aria-hidden="true" className="text-gold-300" size={18} />
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500">Sin datos todavía.</p>
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => {
            const theme = factionTheme(r.faction);
            return (
              <li
                key={r.cha_id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-md text-xs font-black ${
                      i === 0 ? "bg-gold-300/20 text-gold-300" : "bg-white/5 text-neutral-300"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-white">{r.cha_name}</span>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${theme.accent}`}>{theme.short}</span>
                  </span>
                </span>
                <span className="shrink-0 font-fantasy text-lg font-black text-white">{intFmt.format(metric(r))}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default async function BuscadosPage() {
  const { rows, available } = await getLiveCharacters();

  const wanted = rows
    .filter((r) => r.wanted_level >= 1)
    .sort((a, b) => b.wanted_level - a.wanted_level || b.total_kills - a.total_kills)
    .slice(0, 12);

  const topReputation = [...rows].sort((a, b) => b.reputation_points - a.reputation_points).slice(0, 5);
  const topArrests = rows
    .filter((r) => r.faction === 1)
    .sort((a, b) => b.total_arrests - a.total_arrests)
    .slice(0, 5);

  const factionGroups = FACTIONS.map((theme) => ({
    theme,
    members: rows.filter((r) => r.faction === theme.id),
  })).filter((g) => g.members.length > 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-foreground">
      <div aria-hidden="true" className="city-grid pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div aria-hidden="true" className="smoke-texture pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-crimson/40 bg-crimson/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-red-200 shadow-[0_0_34px_rgba(176,0,32,0.18)]">
            <TriangleAlert aria-hidden="true" size={15} />
            TOP ROLEPLAY · Cops vs Gangs
          </div>
          <h1 className="font-fantasy text-4xl font-black leading-none text-white drop-shadow-[0_0_34px_rgba(176,0,32,0.55)] sm:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-b from-white via-red-300 to-crimson bg-clip-text text-transparent">
              Más Buscados
            </span>
            <span className="mt-2 block font-fantasy text-xl font-black tracking-[0.18em] text-gold-300 sm:text-2xl">
              y estado de las facciones
            </span>
          </h1>
          <div className="mx-auto my-6 h-px w-40 bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
          <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
            En vivo desde el servidor: los criminales con mayor nivel de búsqueda, el pulso de cada facción y quiénes
            lideran en reputación y arrestos.
          </p>
        </header>

        {!available && (
          <div className="neon-border city-panel mx-auto mb-10 max-w-xl rounded-2xl p-5 text-center text-sm text-gold-300">
            Los datos de personajes aún no están disponibles. Ejecuta el puente de personajes (SQL Server) para
            sincronizarlos.
          </div>
        )}

        {/* Más Buscados */}
        <section className="mb-16">
          <SectionHeader
            eyebrow="Orden de captura"
            icon={Crosshair}
            title="Los más buscados"
            note="Cuanto mayor el nivel de búsqueda, más peligroso (y más recompensa para la APF)."
          />
          {wanted.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wanted.map((row, i) => (
                <WantedCard key={row.cha_id} position={i + 1} row={row} />
              ))}
            </div>
          ) : (
            <div className="neon-border city-panel district-glow relative overflow-hidden rounded-3xl p-10 text-center sm:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle at 50% 30%, rgba(176,0,32,0.12), transparent 60%)" }}
              />
              <div className="relative">
                <span className="tr-pulse mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-crimson/25 bg-black/50">
                  <Skull aria-hidden="true" className="text-red-300 drop-shadow-[0_0_12px_rgba(176,0,32,0.5)]" size={30} />
                </span>
                <h3 className="font-fantasy text-2xl font-black text-white md:text-3xl">La ciudad está en calma</h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-neutral-300">
                  Ningún criminal tiene orden de búsqueda activa ahora mismo. En cuanto alguien acumule crímenes,
                  aparecerá aquí su cartel de Se Busca.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Facciones */}
        {factionGroups.length > 0 && (
          <>
            <div aria-hidden="true" className="gold-divider mb-16" />
            <section className="mb-16">
              <SectionHeader eyebrow="Equilibrio de poder" icon={Users} title="Las facciones" />
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {factionGroups.map(({ theme, members }) => (
                  <FactionCard key={theme.id} members={members} theme={theme} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Líderes */}
        {(topReputation.length > 0 || topArrests.length > 0) && (
          <>
            <div aria-hidden="true" className="gold-divider mb-16" />
            <section className="mb-4">
              <SectionHeader eyebrow="Leyendas" icon={Award} title="Quién lidera" />
              <div className="grid gap-5 md:grid-cols-2">
                <Leaderboard
                  icon={Star}
                  metric={(r) => r.reputation_points}
                  rows={topReputation}
                  title="Top Reputación"
                />
                <Leaderboard
                  icon={ShieldHalf}
                  metric={(r) => r.total_arrests}
                  rows={topArrests}
                  title="Top Arrestos (APF)"
                />
              </div>
            </section>
          </>
        )}

        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-bold text-neutral-200 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-magic/40 hover:text-white"
            href="/"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Volver al inicio
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full border border-gold-300/35 bg-gold-300/10 px-5 py-2.5 text-sm font-bold text-gold-300 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/60 hover:text-gold-200"
            href="/ranking"
          >
            <Medal aria-hidden="true" size={16} />
            Ver el ranking de temporada
          </Link>
        </div>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-[11px] uppercase tracking-[0.24em] text-neutral-600">
          <Scale aria-hidden="true" size={13} />
          Datos en vivo · se actualiza cada 30s
          <Sparkles aria-hidden="true" size={13} />
        </p>
      </div>
    </main>
  );
}
