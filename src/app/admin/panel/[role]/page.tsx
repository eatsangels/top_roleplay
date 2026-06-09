import { Activity, FileText, Flag, Headphones, ShieldCheck, Users } from "lucide-react";
import { redirect } from "next/navigation";

import { AdminStatCard, DataTable, MiniChart, ModuleCard } from "@/components/admin/admin-cards";
import { GmCommandReference } from "@/components/admin/gm-command-reference";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PriorityQueue, QuickActions, RoleWelcome, ScopeSummary } from "@/components/admin/role-dashboard";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/admin-auth";
import { canAccessModule, canWriteModule, rolePanelContent, rolePanelPaths, rolePermissions } from "@/lib/admin-data";
import { getAdminDashboardData } from "@/lib/admin-live-data";

const roleIcons = {
  super_admin: ShieldCheck,
  admin: Activity,
  moderator: Flag,
  editor: FileText,
  support: Headphones,
};

export default async function RolePanelPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<{ result?: string; error?: string; module?: string }>;
}) {
  const { role: requestedRole } = await params;
  const query = await searchParams;
  const { user, role } = await requireAdmin();
  if (requestedRole !== role) redirect(rolePanelPaths[role]);

  const panel = rolePanelContent[role];
  const data = await getAdminDashboardData(role, user.id);
  const modules = data.modules.filter((module) => panel.focusModules.includes(module.id) && canAccessModule(role, module.id));
  const stats = data.stats.filter((stat) => panel.statLabels.includes(stat.label));
  const queueModules = modules.filter((module) => ["reportes", "tickets", "noticias", "eventos"].includes(module.id));
  const queueItems = queueModules.flatMap((module) => module.records.slice(0, 4).map((record) => ({
    id: `${module.id}-${record.id}`,
    title: record.cells[0] ?? module.title,
    description: record.cells.slice(1, 3).join(" · "),
    priority: record.cells.some((cell) => cell.toLowerCase() === "alta") ? "high" as const : "medium" as const,
    status: record.status,
    href: `${rolePanelPaths[role]}#${module.id}`,
  }))).slice(0, 8);

  return (
    <AdminLayout userEmail={user.email} userName={user.user_metadata?.username} userRole={role}>
      <div className="space-y-8">
        <RoleWelcome description={panel.description} eyebrow={panel.eyebrow} icon={roleIcons[role]} roleLabel={role} title={panel.title} />

        {query.result ? (
          <Card className="border-emerald-400/30 bg-emerald-500/10 p-4">
            <p className="font-bold text-emerald-200">
              {query.result === "created" ? "Registro creado correctamente." : query.result === "updated" ? "Cambios guardados correctamente." : query.result === "deleted" ? "Registro eliminado correctamente." : "Operación completada."}
            </p>
          </Card>
        ) : null}

        {query.error ? (
          <Card className="border-crimson/40 bg-crimson/10 p-4">
            <p className="font-bold text-red-200">
              {query.error === "unauthorized" ? "No tienes permiso para realizar esa operación." : query.error === "delete-failed" ? "No se pudo eliminar el registro. Puede tener datos relacionados." : "No se pudo completar la operación."}
            </p>
          </Card>
        ) : null}

        {data.errors.length ? (
          <Card className="border-crimson/40 p-5">
            <p className="font-bold text-red-300">Algunas consultas permitidas por tu rol fallaron</p>
            <p className="mt-2 text-sm text-neutral-400">{[...new Set(data.errors)].join(" · ")}</p>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => <AdminStatCard key={stat.label} stat={stat} />)}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <PriorityQueue description="Elementos que requieren atención según el alcance de tu rol." items={queueItems} title="Cola prioritaria" />
          <QuickActions actions={panel.quickActions.map((action) => ({ ...action, id: action.href }))} description="Atajos permitidos para tu función." title="Acciones rápidas" />
        </section>

        <ScopeSummary
          description="El panel y las operaciones se ajustan a estos permisos."
          items={modules.map((module) => ({
            id: module.id,
            label: module.title,
            value: module.records.length,
            access: canWriteModule(role, module.id) ? "write" : "read",
            icon: Users,
          }))}
          title="Alcance del rol"
        />

        {canAccessModule(role, "gm") ? <GmCommandReference /> : null}

        {role === "super_admin" ? (
          <section className="grid gap-6 xl:grid-cols-2" id="roles-staff">
            <Card className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Administración de staff</p>
              <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Asignar rol administrativo</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">
                El usuario debe tener una cuenta registrada en TOP ROLEPLAY. Puedes buscarlo por correo o nombre de usuario.
              </p>
              <form action="/api/admin/staff-role" className="mt-6 grid gap-4" method="post">
                <label className="grid gap-2 text-sm font-bold text-neutral-300">
                  Correo o username
                  <input
                    className="rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white outline-none focus:border-cyan-magic/60"
                    name="identifier"
                    placeholder="usuario@correo.com o NombreJugador"
                    required
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-neutral-300">
                  Rol administrativo
                  <select className="rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white" name="role" required>
                    <option value="support">Support</option>
                    <option value="editor">Editor</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super admin</option>
                  </select>
                </label>
                <button className="rounded-xl border border-gold-300/35 bg-gold-300/10 px-4 py-3 text-sm font-bold text-gold-300 hover:bg-gold-300/15" type="submit">
                  Guardar rol de staff
                </button>
              </form>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Permisos por rol</p>
              <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Alcance administrativo</h2>
              <div className="mt-5 grid gap-3">{Object.entries(rolePermissions).map(([name, permissions]) => <div className="rounded-xl border border-white/10 bg-black/35 p-4" key={name}><p className="font-bold text-gold-300">{name}</p><p className="mt-2 text-sm text-neutral-400">{permissions.join(" · ")}</p></div>)}</div>
            </Card>
          </section>
        ) : null}

        {role === "super_admin" ? (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]" id="configuracion">
            <Card className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Configuración web</p>
              <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Página pública</h2>
              <div className="mt-5 grid gap-3">
                {data.settings.map(([label, value]) => <div className="flex justify-between gap-4 rounded-xl border border-white/10 bg-black/35 p-3" key={label}><span className="text-sm text-neutral-400">{label}</span><span className="text-sm font-bold text-gold-300">{value}</span></div>)}
                {data.settings.length === 0 ? <p className="text-sm text-neutral-500">No hay valores guardados.</p> : null}
              </div>
              <form action="/api/admin/site-setting" className="mt-6 grid gap-3" method="post">
                <label className="grid gap-2 text-sm font-bold text-neutral-300">
                  Bloque público
                  <select className="rounded-xl border border-white/15 bg-black/45 px-4 py-3 text-sm text-white" name="key" required>
                    <option value="public_config">Hero, Discord y estado</option>
                    <option value="public_metrics">Métricas públicas</option>
                    <option value="public_content">Contenido completo de la landing</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-bold text-neutral-300">
                  Valor JSON
                  <textarea
                    className="min-h-40 rounded-xl border border-white/15 bg-black/45 px-4 py-3 font-mono text-xs text-white"
                    name="value"
                    placeholder='{"heroEyebrow":"La experiencia oficial TOP ROLEPLAY","heroTagline":"Vive tu historia","heroDescription":"Descripción pública","discordUrl":"https://discord.gg/...","serverStatus":"TOP ROLEPLAY online"}'
                    required
                  />
                </label>
                <p className="text-xs leading-5 text-neutral-500">
                  Para métricas usa una lista con objetos que tengan <code>label</code>, <code>value</code> e <code>icon</code>. Iconos válidos: users, online, guilds, events, history.
                </p>
                <button className="rounded-xl border border-gold-300/35 bg-gold-300/10 px-4 py-3 text-sm font-bold text-gold-300" type="submit">Publicar configuración CMS</button>
              </form>
            </Card>
            <Card className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Flujo CMS</p>
              <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Contenido público real</h2>
              <p className="mt-4 text-sm leading-7 text-neutral-400">
                Noticias, eventos, hero, métricas y Discord se muestran desde Supabase. Los editores pueden gestionar noticias, eventos y galería; solo super admin puede publicar configuración global.
              </p>
            </Card>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          {data.charts.slice(0, role === "super_admin" || role === "admin" ? 4 : 2).map((chart) => <MiniChart key={chart.title} {...chart} />)}
        </section>

        <div className="space-y-8">{modules.map((module) => <ModuleCard key={module.id} module={module} />)}</div>

        <Card className="p-6">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">Tu actividad reciente</p>
          <h2 className="mt-2 font-fantasy text-2xl font-black text-white">Bitácora visible</h2>
          <div className="mt-5"><DataTable headers={["Admin", "Acción", "Módulo", "Fecha", "IP", "Detalles"]} records={data.recentLogs} /></div>
        </Card>
      </div>
    </AdminLayout>
  );
}
