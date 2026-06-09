import { BarChart3, Bell, BookOpen, CalendarDays, Download, FileText, Flag, Shield, Swords, Users } from "lucide-react";

import { canWriteModule, type AdminRole } from "@/lib/admin-data";
import { adminRecordForms } from "@/lib/admin-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRecord = {
  id: string;
  cells: string[];
  status?: string;
};

export type AdminModule = {
  id: string;
  title: string;
  description: string;
  headers: string[];
  records: AdminRecord[];
  statusOptions?: string[];
  createHref?: string;
  manageRecords?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeZone: "UTC" });
const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

function date(value?: string | null) {
  return value ? dateFormatter.format(new Date(value)) : "Sin fecha";
}

function dateTime(value?: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "Nunca";
}

function text(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isMissingOptionalTableError(message: string) {
  return ["public.sanctions", "public.public_sections", "public.public_content"].some((table) => message.includes(`Could not find the table '${table}' in the schema cache`));
}

function bars(dates: Array<string | null | undefined>) {
  const now = new Date();
  const counts = Array.from({ length: 7 }, () => 0);
  for (const value of dates) {
    if (!value) continue;
    const days = Math.floor((now.getTime() - new Date(value).getTime()) / 86_400_000);
    if (days >= 0 && days < 7) counts[6 - days] += 1;
  }
  const max = Math.max(...counts, 1);
  return counts.map((count) => count === 0 ? 4 : Math.max(12, Math.round((count / max) * 100)));
}

function normalized(values: number[]) {
  const max = Math.max(...values, 1);
  return values.length ? values.map((value) => Math.max(8, Math.round((value / max) * 100))) : [4];
}

export async function getAdminDashboardData(role: AdminRole, userId: string) {
  const db = await createSupabaseServerClient();
  const logsQuery = db.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(30);
  if (role !== "super_admin") logsQuery.eq("admin_user_id", userId);
  const results = await Promise.all([
    db.from("profiles").select("id,email,username,created_at"),
    db.from("admin_roles").select("id,user_id,role,created_at"),
    db.from("players").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("characters").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("guilds").select("*").order("points", { ascending: false }).limit(100),
    db.from("rankings").select("*").order("points", { ascending: false }).limit(100),
    db.from("news").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("events").select("*").order("starts_at", { ascending: false }).limit(100),
    db.from("gallery").select("*").order("sort_order", { ascending: true }).limit(100),
    db.from("downloads").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("public_sections").select("*").order("sort_order", { ascending: true }).limit(100),
    db.from("public_content").select("*").order("sort_order", { ascending: true }).limit(200),
    db.from("reports").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("tickets").select("*").order("created_at", { ascending: false }).limit(100),
    db.from("site_settings").select("*").order("key", { ascending: true }),
    logsQuery,
    db.from("sanctions").select("*").order("created_at", { ascending: false }).limit(100),
  ]);

  const [profiles, roles, players, characters, guilds, rankings, news, events, gallery, downloads, publicSections, publicContent, reports, tickets, settings, logs, sanctions] =
    results.map((result) => result.data ?? []);
  const errors = results.flatMap((result) => result.error && !isMissingOptionalTableError(result.error.message) ? [result.error.message] : []);
  const todayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const onlineIso = new Date(Date.now() - 15 * 60_000).toISOString();
  const countResults = await Promise.all([
    db.from("players").select("*", { count: "exact", head: true }),
    db.from("players").select("*", { count: "exact", head: true }).gte("last_login_at", onlineIso),
    db.from("players").select("*", { count: "exact", head: true }).gte("created_at", todayIso),
    db.from("guilds").select("*", { count: "exact", head: true }).eq("status", "activo"),
    db.from("events").select("*", { count: "exact", head: true }).in("status", ["activo", "destacado"]),
    db.from("reports").select("*", { count: "exact", head: true }).eq("status", "pendiente"),
    db.from("news").select("*", { count: "exact", head: true }).eq("status", "publicado"),
    db.from("downloads").select("*", { count: "exact", head: true }).eq("status", "activo"),
    db.from("tickets").select("*", { count: "exact", head: true }).eq("status", "pendiente"),
  ]);
  errors.push(...countResults.flatMap((result) => result.error ? [result.error.message] : []));
  const counts = countResults.map((result) => result.count ?? 0);
  const profileMap = new Map(profiles.map((item) => [item.id, item]));
  const playerMap = new Map(players.map((item) => [item.id, item]));
  const guildMap = new Map(guilds.map((item) => [item.id, item]));
  const publicSectionMap = new Map(publicSections.map((item) => [item.id, item]));
  const characterCounts = new Map<string, number>();
  characters.forEach((item) => characterCounts.set(item.player_id, (characterCounts.get(item.player_id) ?? 0) + 1));

  const stats = [
    { label: "Jugadores registrados", value: String(counts[0]), trend: "Total exacto en players", icon: Users },
    { label: "Jugadores online", value: String(counts[1]), trend: "Actividad en últimos 15 min", icon: Bell },
    { label: "Cuentas nuevas hoy", value: String(counts[2]), trend: "Desde medianoche", icon: BookOpen },
    { label: "Clanes activos", value: String(counts[3]), trend: `${guilds.length} mostrados`, icon: Shield },
    { label: "Eventos activos", value: String(counts[4]), trend: `${events.length} mostrados`, icon: CalendarDays },
    { label: "Reportes pendientes", value: String(counts[5]), trend: `${reports.length} mostrados`, icon: Flag },
    { label: "Noticias publicadas", value: String(counts[6]), trend: `${news.length} mostradas`, icon: FileText },
    { label: "Descargas activas", value: String(counts[7]), trend: `${downloads.length} mostradas`, icon: Download },
    { label: "Tickets pendientes", value: String(counts[8]), trend: `${tickets.length} tickets mostrados`, icon: Flag },
  ];

  const charts = [
    { title: "Nuevos jugadores por día", icon: BarChart3, values: bars(players.map((item) => item.created_at)) },
    { title: "Actividad semanal", icon: CalendarDays, values: bars(characters.map((item) => item.last_activity_at)) },
    { title: "Top clanes", icon: Shield, values: normalized(guilds.slice(0, 7).map((item) => Number(item.points))) },
    { title: "Eventos más participados", icon: Swords, values: normalized(events.slice(0, 7).map((item) => Number(item.participants_count))) },
  ];

  const modules: AdminModule[] = [
    { id: "jugadores", title: "Jugadores", description: "Cuentas registradas y estado real.", headers: ["Usuario", "Email", "Estado", "Rol", "Registro", "Última conexión", "Personajes"], statusOptions: ["activo", "pendiente", "suspendido", "baneado"], records: players.map((item) => ({ id: item.id, status: item.status, cells: [item.username, item.email, item.status, item.role, date(item.created_at), dateTime(item.last_login_at), String(characterCounts.get(item.id) ?? 0)] })) },
    { id: "personajes", title: "Personajes", description: "Personajes existentes en el servidor.", headers: ["Nombre", "Nivel", "Clase", "Facción", "Clan", "Oro", "Experiencia", "Estado", "Dueño", "Actividad"], statusOptions: ["activo", "bloqueado"], records: characters.map((item) => ({ id: item.id, status: item.status, cells: [item.name, String(item.level), item.class, text(item.faction), guildMap.get(item.guild_id)?.name ?? "Sin clan", String(item.gold), String(item.experience), item.status, playerMap.get(item.player_id)?.username ?? "Sin dueño", dateTime(item.last_activity_at)] })) },
    { id: "clanes", title: "Clanes", description: "Clanes creados y sus métricas reales.", headers: ["Clan", "Líder", "Miembros", "Puntos", "Nivel", "Estado", "Creado"], statusOptions: ["activo", "inactivo"], createHref: "/admin/nuevo/clanes", records: guilds.map((item) => ({ id: item.id, status: item.status, cells: [item.name, playerMap.get(item.leader_player_id)?.username ?? "Sin líder", String(item.members_count), String(item.points), String(item.guild_level), item.status, date(item.created_at)] })) },
    { id: "ranking", title: "Ranking", description: "Entradas reales del ranking público.", headers: ["Jugador/Clan", "Tipo", "Puntos", "Destacado", "Visible", "Actualizado"], createHref: "/admin/nuevo/ranking", records: rankings.map((item) => ({ id: item.id, cells: [playerMap.get(item.player_id)?.username ?? guildMap.get(item.guild_id)?.name ?? "Sin entidad", item.ranking_type, String(item.points), item.is_featured ? "Sí" : "No", item.is_visible ? "Sí" : "No", date(item.updated_at)] })) },
    { id: "noticias", title: "Noticias", description: "Contenido editorial almacenado en Supabase.", headers: ["Título", "Slug", "Categoría", "Estado", "Publicación", "Autor"], statusOptions: ["borrador", "publicado", "archivado"], createHref: "/admin/nuevo/noticias", records: news.map((item) => ({ id: item.id, status: item.status, cells: [item.title, item.slug, item.category, item.status, dateTime(item.published_at), profileMap.get(item.author_id)?.username ?? "Sin autor"] })) },
    { id: "eventos", title: "Eventos", description: "Eventos reales y participación registrada.", headers: ["Evento", "Inicio", "Tipo", "Estado", "Recompensa", "Participantes", "Destacado"], statusOptions: ["activo", "destacado", "cancelado", "finalizado"], createHref: "/admin/nuevo/eventos", records: events.map((item) => ({ id: item.id, status: item.status, cells: [item.name, dateTime(item.starts_at), item.event_type, item.status, text(item.rewards), String(item.participants_count), item.is_featured ? "Sí" : "No"] })) },
    { id: "galeria", title: "Galería", description: "Imágenes registradas en Supabase Storage.", headers: ["Título", "Categoría", "URL", "Activa", "Destacada", "Orden"], createHref: "/admin/nuevo/galeria", records: gallery.map((item) => ({ id: item.id, cells: [item.title, item.category, item.image_url, item.is_active ? "Sí" : "No", item.is_featured ? "Sí" : "No", String(item.sort_order)] })) },
    { id: "descargas", title: "Descargas", description: "Archivos reales configurados para jugadores.", headers: ["Archivo", "Versión", "Tipo", "Tamaño", "Estado", "Principal", "Actualizado"], statusOptions: ["activo", "inactivo"], createHref: "/admin/nuevo/descargas", records: downloads.map((item) => ({ id: item.id, status: item.status, cells: [item.name, item.version, item.download_type, text(item.file_size), item.status, item.is_primary ? "Sí" : "No", dateTime(item.updated_file_at ?? item.updated_at)] })) },
    { id: "cms_secciones", title: "Secciones CMS", description: "Estructura completa de la página pública.", headers: ["Clave", "Título", "Tipo", "Ubicación", "Estado", "Activa", "Orden"], createHref: "/admin/nuevo/cms_secciones", records: publicSections.map((item) => ({ id: item.id, cells: [item.key, item.title, item.section_type, item.location, item.status, item.is_active ? "Sí" : "No", String(item.sort_order)] })) },
    { id: "cms_contenido", title: "Contenido CMS", description: "Textos, enlaces, tarjetas, FAQ, capítulos y medios públicos.", headers: ["Sección", "Clave", "Tipo", "Título", "Estado", "Activo", "Orden"], createHref: "/admin/nuevo/cms_contenido", records: publicContent.map((item) => ({ id: item.id, cells: [publicSectionMap.get(item.section_id)?.title ?? "Sin sección", item.key, item.content_type, text(item.title), item.status, item.is_active ? "Sí" : "No", String(item.sort_order)] })) },
    { id: "reportes", title: "Reportes", description: "Reportes enviados por la comunidad.", headers: ["Reporta", "Reportado", "Motivo", "Estado", "Prioridad", "Staff", "Fecha"], statusOptions: ["pendiente", "en_revision", "resuelto", "rechazado"], records: reports.map((item) => ({ id: item.id, status: item.status, cells: [playerMap.get(item.reporter_player_id)?.username ?? "Desconocido", playerMap.get(item.reported_player_id)?.username ?? "Desconocido", item.reason, item.status, item.priority, profileMap.get(item.assigned_staff_id)?.username ?? "Sin asignar", dateTime(item.created_at)] })) },
    { id: "tickets", title: "Tickets", description: "Solicitudes reales de soporte.", headers: ["Usuario", "Categoría", "Asunto", "Mensaje/Adjunto", "Estado", "Prioridad", "Staff", "Fecha"], statusOptions: ["pendiente", "en_revision", "resuelto", "rechazado", "cerrado"], records: tickets.map((item) => ({ id: item.id, status: item.status, cells: [playerMap.get(item.player_id)?.username ?? "Desconocido", item.category, item.subject, text(item.message), item.status, item.priority, profileMap.get(item.assigned_staff_id)?.username ?? "Sin asignar", dateTime(item.created_at)] })) },
    { id: "sanciones", title: "Sanciones", description: "Historial real de sanciones aplicadas.", headers: ["Jugador", "Tipo", "Motivo", "Emitida por", "Expira", "Revocada", "Fecha"], createHref: "/admin/nuevo/sanciones", records: sanctions.map((item) => ({ id: item.id, cells: [playerMap.get(item.player_id)?.username ?? "Desconocido", item.sanction_type, item.reason, profileMap.get(item.issued_by)?.username ?? "Sin autor", dateTime(item.expires_at), dateTime(item.revoked_at), dateTime(item.created_at)] })) },
    { id: "staff", title: "Staff", description: "Roles administrativos asignados en Supabase.", headers: ["Usuario", "Email", "Rol", "Creado"], records: roles.map((item) => ({ id: item.id, cells: [profileMap.get(item.user_id)?.username ?? "Sin perfil", profileMap.get(item.user_id)?.email ?? "Sin email", item.role, date(item.created_at)] })) },
    { id: "logs", title: "Logs", description: "Acciones administrativas registradas.", headers: ["Admin", "Acción", "Módulo", "Fecha", "IP", "Detalles"], records: logs.map((item) => ({ id: item.id, cells: [profileMap.get(item.admin_user_id)?.username ?? "Sistema", item.action, item.module, dateTime(item.created_at), text(item.ip), text(item.details)] })) },
  ];

  return {
    stats,
    charts,
    modules: modules
      .filter((module) => role === "super_admin" || module.id !== "staff")
      .map((module) => canWriteModule(role, module.id)
        ? { ...module, manageRecords: Boolean(adminRecordForms[module.id]) }
        : { ...module, statusOptions: undefined, createHref: undefined, manageRecords: false }),
    settings: settings.map((item) => [item.key, text(item.value)] as [string, string]),
    recentLogs: modules.find((module) => module.id === "logs")?.records.slice(0, 8) ?? [],
    errors,
  };
}
