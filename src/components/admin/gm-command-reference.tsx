"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Copy, Search, ShieldAlert, Terminal } from "lucide-react";

import { Card } from "@/components/ui/card";
import {
  gmCharacterAttributes,
  gmCommandCategories,
  gmCommandRecipes,
  gmCommands,
  gmCommandSources,
  gmCommandStats,
  gmJobAttributes,
  gmPetAttributes,
  type GmCommand,
  type GmCommandConfidence,
} from "@/lib/gm-commands";
import { cn } from "@/lib/utils";

const confidenceLabel: Record<GmCommandConfidence, string> = {
  verificado: "Nombre verificado",
  comun: "Uso común",
  variante: "Depende de la build",
};

const riskClass: Record<GmCommand["risk"], string> = {
  Bajo: "border-emerald-300/25 bg-emerald-400/10 text-emerald-200",
  Medio: "border-cyan-magic/25 bg-cyan-magic/10 text-cyan-magic",
  Alto: "border-gold-300/25 bg-gold-300/10 text-gold-300",
  Critico: "border-crimson/35 bg-crimson/10 text-red-200",
};

export function GmCommandReference() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return gmCommands.filter((command) => {
      const matchesCategory = category === "Todos" || command.category === category;
      const matchesQuery = !needle || [
        command.command,
        command.title,
        command.syntax,
        command.example,
        command.description,
        command.notes,
        command.server,
      ].some((value) => value.toLowerCase().includes(needle));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  async function copyCommand(command: string, example: string) {
    const text = example || command;
    await navigator.clipboard.writeText(text);
    setCopied(command);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <section className="space-y-6" id="gm">
      <Card className="overflow-hidden border-cyan-magic/25 bg-black/55">
        <div className="border-b border-white/10 bg-[radial-gradient(circle_at_12%_0%,rgba(0,229,255,0.18),transparent_22rem),linear-gradient(135deg,rgba(176,0,32,0.22),transparent_38%)] p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">
                <Terminal size={17} />
                GM · Tales of Pirates / PKO
              </p>
              <h2 className="mt-3 font-fantasy text-3xl font-black text-white">Manual operativo de comandos GM</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-300">
                Referencia organizada para staff. Incluye los nombres encontrados en GameServer 1.36/1.38 y GroupServer 1.38, mas aliases comunitarios separados. No ejecuta comandos desde la web.
              </p>
            </div>
            <div className="rounded-2xl border border-crimson/35 bg-crimson/10 p-4 text-sm leading-6 text-red-100 lg:max-w-sm">
              <div className="mb-2 flex items-center gap-2 font-black text-red-200">
                <ShieldAlert size={18} />
                Validar antes de usar
              </div>
              El nombre puede estar verificado y aun asi cambiar su sintaxis. Confirma los parametros en tu ejecutable y prueba primero fuera de produccion.
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-white/10 p-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Catalogo total", gmCommandStats.total],
            ["GameServer verificados", gmCommandStats.verifiedGameServer],
            ["GroupServer verificados", gmCommandStats.verifiedGroupServer],
            ["Aliases de variantes", gmCommandStats.variants],
          ].map(([label, value]) => (
            <div className="rounded-xl border border-white/10 bg-black/35 p-4" key={label}>
              <p className="text-2xl font-black text-gold-300">{value}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-neutral-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_16rem]">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-neutral-300 focus-within:border-cyan-magic/60">
            <Search className="text-cyan-magic" size={18} />
            <input
              className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por comando, uso, riesgo o ejemplo..."
              value={query}
            />
          </label>
          <select
            className="rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-sm font-bold text-white outline-none focus:border-cyan-magic/60"
            onChange={(event) => setCategory(event.target.value)}
            value={category}
          >
            <option>Todos</option>
            {gmCommandCategories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <ReferenceTable
          description="Usa &attr 4,<job_id>[,<character_id>]."
          items={gmJobAttributes}
          title="IDs de trabajos"
        />
        <ReferenceTable
          description="Usa &attr <id>,<valor>[,<character_id>]. Los IDs rojos son especialmente delicados."
          items={gmCharacterAttributes}
          title="IDs de atributos"
        />
        <ReferenceTable
          description="Usa &itemattr 2,1,<id>,<cantidad>."
          items={gmPetAttributes}
          title="IDs de atributos pet"
        />
      </div>

      <Card className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Recetas operativas</p>
        <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Flujos comunes de GM</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {gmCommandRecipes.map((recipe) => (
            <div className="rounded-xl border border-white/10 bg-black/35 p-4" key={recipe.title}>
              <p className="font-black text-white">{recipe.title}</p>
              <div className="mt-3 space-y-2">
                {recipe.steps.map((step) => <code className="block rounded-lg border border-gold-300/15 bg-black/55 px-3 py-2 text-xs text-gold-300" key={step}>{step}</code>)}
              </div>
              <p className="mt-3 text-xs leading-5 text-neutral-400">{recipe.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {filtered.map((command) => (
          <Card className="group overflow-hidden p-0 transition hover:border-cyan-magic/40" key={`${command.command}-${command.title}`}>
            <div className="flex items-start justify-between gap-4 border-b border-white/10 bg-black/35 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <code className="rounded-lg border border-gold-300/25 bg-gold-300/10 px-2 py-1 text-lg font-black text-gold-300">{command.command}</code>
                  <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider", riskClass[command.risk])}>
                    Riesgo {command.risk}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-300">
                    {confidenceLabel[command.confidence]}
                  </span>
                  <span className="rounded-full border border-cyan-magic/20 bg-cyan-magic/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-magic">
                    {command.server}
                  </span>
                </div>
                <h3 className="mt-3 font-fantasy text-2xl font-black text-white">{command.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-400">{command.description}</p>
              </div>
              <button
                className="rounded-xl border border-cyan-magic/25 p-2 text-cyan-magic transition hover:bg-cyan-magic/10"
                onClick={() => copyCommand(command.command, command.example)}
                title="Copiar ejemplo"
                type="button"
              >
                {copied === command.command ? <CheckCircle2 size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Sintaxis</p>
                <code className="mt-2 block rounded-xl border border-white/10 bg-black/55 p-3 text-sm text-cyan-magic">{command.syntax}</code>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Ejemplo</p>
                <code className="mt-2 block rounded-xl border border-white/10 bg-black/55 p-3 text-sm text-gold-300">{command.example}</code>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-gold-300/15 bg-gold-300/5 p-3 text-sm leading-6 text-neutral-300">
                <AlertTriangle className="mt-0.5 shrink-0 text-gold-300" size={17} />
                {command.notes}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Fuentes y criterio</p>
        <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Por que algunos comandos dicen “depende de la build”</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-neutral-400">
          La base editgmcmd permite verificar nombres presentes en ejecutables conocidos, pero no documenta de forma universal todos sus parametros. Por eso las sintaxis del manual son plantillas operativas y deben comprobarse en tu servidor.
        </p>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          {gmCommandSources.map((source) => (
            <a className="rounded-xl border border-white/10 bg-black/35 p-4 transition hover:border-gold-300/30 hover:bg-gold-300/5" href={source.href} key={source.href} rel="noreferrer" target="_blank">
              <p className="font-black text-gold-300">{source.label}</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">{source.detail}</p>
            </a>
          ))}
        </div>
      </Card>
    </section>
  );
}

function ReferenceTable({
  description,
  items,
  title,
}: {
  description: string;
  items: ReadonlyArray<{ id: number; label: string; warning?: boolean }>;
  title: string;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-fantasy text-xl font-black text-white">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-neutral-400">{description}</p>
      <div className="mt-4 max-h-72 space-y-1 overflow-y-auto pr-1">
        {items.map((item) => (
          <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-black/25 px-3 py-2 text-sm" key={item.id}>
            <code className={cn("w-9 font-black", item.warning ? "text-red-300" : "text-cyan-magic")}>{item.id}</code>
            <span className="text-neutral-300">{item.label}</span>
            {item.warning ? <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-red-300">Delicado</span> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
