import { Card } from "@/components/ui/card";
import type { AdminModule, AdminRecord } from "@/lib/admin-live-data";
import { cn } from "@/lib/utils";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export function AdminStatCard({ stat }: { stat: { label: string; value: string; trend: string; icon: React.ElementType } }) {
  return (
    <Card className="group relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-cyan-magic/5 transition group-hover:bg-gold-300/10" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-neutral-500">{stat.label}</p>
          <p className="mt-3 font-fantasy text-3xl font-black text-gold-300">{stat.value}</p>
          <p className="mt-2 text-xs text-cyan-magic">{stat.trend}</p>
        </div>
        <div className="rounded-2xl border border-cyan-magic/20 bg-cyan-magic/10 p-3 text-cyan-magic shadow-[0_0_28px_rgba(0,229,255,0.08)]">
          <stat.icon size={24} />
        </div>
      </div>
    </Card>
  );
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase().replaceAll("_", " ");
  const label = normalized === "en revision" ? "En revisión" : value;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-black uppercase tracking-wide",
        (normalized.includes("activo") || normalized.includes("online") || normalized.includes("publicado") || normalized.includes("visible")) && "bg-emerald-500/15 text-emerald-300",
        (normalized.includes("pendiente") || normalized.includes("borrador")) && "bg-yellow-500/15 text-yellow-300",
        (normalized.includes("suspendido") || normalized.includes("revision") || normalized.includes("revisión")) && "bg-orange-500/15 text-orange-300",
        (normalized.includes("baneado") || normalized.includes("bloqueado") || normalized.includes("cerrado")) && "bg-red-500/15 text-red-300",
        (normalized.includes("destacado") || normalized.includes("top")) && "bg-cyan-magic/15 text-cyan-magic",
      )}
    >
      {label}
    </span>
  );
}

export function DataTable({ headers, manageRecords, records, moduleId, statusOptions }: { headers: string[]; manageRecords?: boolean; records: AdminRecord[]; moduleId?: string; statusOptions?: string[] }) {
  const statusValues = ["activo", "pendiente", "suspendido", "baneado", "publicado", "borrador", "destacado", "visible", "bloqueado", "cerrado", "en revisión", "en_revision", "resuelto", "inactiva", "alta", "media", "baja"];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-gold-300/10 text-xs uppercase tracking-wider text-gold-300">
          <tr>{headers.map((header) => <th className="p-3" key={header}>{header}</th>)}<th className="p-3">Acciones</th></tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr className="border-t border-white/10 transition hover:bg-cyan-magic/5" key={record.id}>
              {record.cells.map((cell, index) => (
                <td className="p-3 text-neutral-300" key={`${cell}-${index}`}>
                  {statusValues.includes(cell.toLowerCase()) ? <StatusBadge value={cell} /> : cell}
                </td>
              ))}
              <td className="p-3">
                <div className="flex flex-wrap gap-2">
                  {moduleId && statusOptions && record.status ? (
                    <form action="/api/admin/record-status" className="flex gap-2" method="post">
                      <input name="id" type="hidden" value={record.id} />
                      <input name="module" type="hidden" value={moduleId} />
                      <select className="rounded-lg border border-white/15 bg-black px-2 py-1.5 text-xs text-white" defaultValue={record.status} name="status">
                        {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                      <button className="rounded-lg border border-gold-300/20 px-3 py-1.5 text-xs font-bold text-gold-300 hover:bg-gold-300/10" type="submit">Guardar</button>
                    </form>
                  ) : null}
                  {moduleId && manageRecords ? (
                    <>
                      <Link className="rounded-lg border border-cyan-magic/25 px-3 py-1.5 text-xs font-bold text-cyan-magic hover:bg-cyan-magic/10" href={`/admin/editar/${moduleId}/${record.id}`}>
                        <Pencil className="mr-1 inline" size={13} />Editar
                      </Link>
                      <form action="/api/admin/delete-record" method="post">
                        <input name="id" type="hidden" value={record.id} />
                        <input name="module" type="hidden" value={moduleId} />
                        <button className="rounded-lg border border-red-400/25 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/10" name="confirm_id" type="submit" value={record.id}>
                          <Trash2 className="mr-1 inline" size={13} />Eliminar
                        </button>
                      </form>
                    </>
                  ) : null}
                  {!statusOptions && !manageRecords ? <span className="text-xs text-neutral-600">Solo lectura</span> : null}
                </div>
              </td>
            </tr>
          ))}
          {records.length === 0 ? (
            <tr>
              <td className="p-8 text-center text-sm text-neutral-500" colSpan={headers.length + 1}>No hay registros reales en este módulo.</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function ModuleCard({ module }: { module: AdminModule }) {
  return (
    <section className="scroll-mt-28" id={module.id}>
      <Card className="overflow-hidden">
        <div className="relative flex flex-col gap-4 border-b border-gold-300/15 p-5 md:flex-row md:items-center md:justify-between">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/50 to-transparent" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Bitácora administrativa</p>
            <h2 className="mt-2 font-fantasy text-2xl font-black text-white">{module.title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">{module.description}</p>
          </div>
          {module.createHref ? (
            <Link className="rounded-xl border border-gold-300/35 bg-gold-300/10 px-4 py-2 text-sm font-bold text-gold-300 hover:bg-gold-300/15" href={module.createHref}>
              <Plus className="mr-2 inline" size={15} />Crear
            </Link>
          ) : null}
        </div>
        <DataTable headers={module.headers} manageRecords={module.manageRecords} moduleId={module.id} records={module.records} statusOptions={module.statusOptions} />
        <div className="flex items-center justify-between border-t border-white/10 bg-black/25 p-4 text-xs text-neutral-500">
          <span>Mostrando {module.records.length} registros reales</span>
          <span>Fuente: Supabase</span>
        </div>
      </Card>
    </section>
  );
}

export function MiniChart({ title, icon: Icon, values }: { title: string; icon: React.ElementType; values: number[] }) {
  return (
    <Card className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-bold text-white">{title}</h3>
        <Icon className="text-cyan-magic" size={20} />
      </div>
      <div className="flex h-32 items-end gap-2">
        {values.map((value, index) => (
          <div className="flex-1 rounded-t-lg bg-gradient-to-t from-crimson via-gold-600 to-gold-300 shadow-[0_0_18px_rgba(212,175,55,0.22)]" key={`${title}-${index}`} style={{ height: `${value}%` }} />
        ))}
      </div>
    </Card>
  );
}
