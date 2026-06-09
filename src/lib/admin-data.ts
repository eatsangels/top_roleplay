import {
  CalendarDays,
  Download,
  FileImage,
  FileText,
  Flag,
  Gauge,
  Gavel,
  LifeBuoy,
  ListOrdered,
  Logs,
  Settings,
  Shield,
  Swords,
  Terminal,
  Users,
} from "lucide-react";

export type AdminRole = "super_admin" | "admin" | "moderator" | "editor" | "support";

export const rolePanelPaths: Record<AdminRole, string> = {
  super_admin: "/admin/panel/super_admin",
  admin: "/admin/panel/admin",
  moderator: "/admin/panel/moderator",
  editor: "/admin/panel/editor",
  support: "/admin/panel/support",
};

export const rolePanelContent: Record<AdminRole, {
  title: string;
  eyebrow: string;
  description: string;
  focusModules: string[];
  statLabels: string[];
  quickActions: Array<{ label: string; href: string; description: string }>;
}> = {
  super_admin: {
    title: "Centro de mando",
    eyebrow: "Super administración",
    description: "Visión completa del servidor, seguridad, staff, configuración y auditoría.",
    focusModules: ["gm", "jugadores", "personajes", "clanes", "ranking", "noticias", "eventos", "galeria", "descargas", "cms_secciones", "cms_contenido", "reportes", "tickets", "sanciones", "staff", "logs"],
    statLabels: ["Jugadores registrados", "Jugadores online", "Eventos activos", "Reportes pendientes", "Noticias publicadas", "Descargas activas"],
    quickActions: [
      { label: "Configurar web", href: "/admin/panel/super_admin#configuracion", description: "Editar valores públicos del servidor." },
      { label: "Gestionar staff", href: "/admin/panel/super_admin#roles-staff", description: "Asignar y consultar roles administrativos." },
      { label: "Manual GM", href: "/admin/panel/super_admin#gm", description: "Consultar comandos, ejemplos y riesgos." },
      { label: "Ver auditoría", href: "/admin/panel/super_admin#logs", description: "Inspeccionar acciones recientes." },
    ],
  },
  admin: {
    title: "Operaciones del servidor",
    eyebrow: "Administración",
    description: "Gestiona jugadores, personajes, clanes, ranking, eventos, noticias y descargas.",
    focusModules: ["gm", "jugadores", "personajes", "clanes", "ranking", "noticias", "eventos", "descargas", "cms_secciones", "cms_contenido", "reportes"],
    statLabels: ["Jugadores registrados", "Jugadores online", "Cuentas nuevas hoy", "Clanes activos", "Eventos activos", "Reportes pendientes"],
    quickActions: [
      { label: "Crear evento", href: "/admin/nuevo/eventos", description: "Publicar una nueva actividad." },
      { label: "Manual GM", href: "/admin/panel/admin#gm", description: "Consultar comandos operativos y ejemplos." },
      { label: "Crear noticia", href: "/admin/nuevo/noticias", description: "Informar a la comunidad." },
      { label: "Añadir descarga", href: "/admin/nuevo/descargas", description: "Configurar cliente o parche." },
    ],
  },
  moderator: {
    title: "Sala de moderación",
    eyebrow: "Moderación",
    description: "Prioriza reportes, revisa cuentas y supervisa personajes sin acceso editorial.",
    focusModules: ["gm", "reportes", "sanciones", "jugadores", "personajes", "logs"],
    statLabels: ["Jugadores online", "Reportes pendientes", "Jugadores registrados"],
    quickActions: [
      { label: "Reportes pendientes", href: "/admin/panel/moderator#reportes", description: "Resolver incidencias prioritarias." },
      { label: "Revisar jugadores", href: "/admin/panel/moderator#jugadores", description: "Consultar estado de cuentas." },
      { label: "Manual GM", href: "/admin/panel/moderator#gm", description: "Consultar herramientas de moderación en juego." },
      { label: "Revisar personajes", href: "/admin/panel/moderator#personajes", description: "Consultar actividad de personajes." },
    ],
  },
  editor: {
    title: "Estudio editorial",
    eyebrow: "Contenido",
    description: "Crea y publica noticias, eventos e imágenes para la web pública.",
    focusModules: ["noticias", "eventos", "galeria", "cms_secciones", "cms_contenido", "logs"],
    statLabels: ["Noticias publicadas", "Eventos activos"],
    quickActions: [
      { label: "Crear noticia", href: "/admin/nuevo/noticias", description: "Redactar una actualización." },
      { label: "Crear evento", href: "/admin/nuevo/eventos", description: "Anunciar una actividad." },
      { label: "Añadir imagen", href: "/admin/nuevo/galeria", description: "Actualizar la galería pública." },
    ],
  },
  support: {
    title: "Centro de soporte",
    eyebrow: "Atención al jugador",
    description: "Gestiona tickets y reportes asignados para ayudar a la comunidad.",
    focusModules: ["tickets", "reportes", "logs"],
    statLabels: ["Tickets pendientes", "Reportes pendientes"],
    quickActions: [
      { label: "Abrir tickets", href: "/admin/panel/support#tickets", description: "Responder solicitudes de ayuda." },
      { label: "Revisar reportes", href: "/admin/panel/support#reportes", description: "Clasificar incidencias recibidas." },
    ],
  },
};

export const rolePermissions: Record<AdminRole, string[]> = {
  super_admin: ["Acceso total", "Manual GM", "Roles y permisos", "Configuración", "Logs"],
  admin: ["Manual GM", "Jugadores", "Eventos", "Noticias", "Rankings", "Descargas"],
  moderator: ["Manual GM", "Jugadores", "Reportes", "Sanciones"],
  editor: ["Noticias", "Eventos", "Galería"],
  support: ["Tickets", "Reportes"],
};

export const moduleRoles: Record<string, AdminRole[]> = {
  jugadores: ["super_admin", "admin", "moderator"],
  personajes: ["super_admin", "admin", "moderator"],
  clanes: ["super_admin", "admin"],
  ranking: ["super_admin", "admin"],
  noticias: ["super_admin", "admin", "editor"],
  eventos: ["super_admin", "admin", "editor"],
  galeria: ["super_admin", "admin", "editor"],
  cms_secciones: ["super_admin", "admin", "editor"],
  cms_contenido: ["super_admin", "admin", "editor"],
  descargas: ["super_admin", "admin"],
  reportes: ["super_admin", "admin", "moderator", "support"],
  sanciones: ["super_admin", "admin", "moderator"],
  tickets: ["super_admin", "support"],
  staff: ["super_admin"],
  configuracion: ["super_admin"],
  logs: ["super_admin", "admin", "moderator", "editor", "support"],
  gm: ["super_admin", "admin", "moderator"],
};

export const moduleWriteRoles: Record<string, AdminRole[]> = {
  jugadores: ["super_admin", "admin"],
  personajes: ["super_admin", "admin"],
  clanes: ["super_admin", "admin"],
  ranking: ["super_admin", "admin"],
  noticias: ["super_admin", "admin", "editor"],
  eventos: ["super_admin", "admin", "editor"],
  galeria: ["super_admin", "admin", "editor"],
  cms_secciones: ["super_admin", "admin", "editor"],
  cms_contenido: ["super_admin", "admin", "editor"],
  descargas: ["super_admin", "admin"],
  reportes: ["super_admin", "admin", "moderator", "support"],
  sanciones: ["super_admin", "admin", "moderator"],
  tickets: ["super_admin", "support"],
  staff: ["super_admin"],
  configuracion: ["super_admin"],
};

export const adminNav = [
  { label: "Dashboard", href: "/admin", icon: Gauge, id: "dashboard" },
  { label: "GM", href: "/admin#gm", icon: Terminal, id: "gm" },
  { label: "Jugadores", href: "/admin#jugadores", icon: Users, id: "jugadores" },
  { label: "Personajes", href: "/admin#personajes", icon: Swords, id: "personajes" },
  { label: "Clanes", href: "/admin#clanes", icon: Shield, id: "clanes" },
  { label: "Ranking", href: "/admin#ranking", icon: ListOrdered, id: "ranking" },
  { label: "Noticias", href: "/admin#noticias", icon: FileText, id: "noticias" },
  { label: "Eventos", href: "/admin#eventos", icon: CalendarDays, id: "eventos" },
  { label: "Galería", href: "/admin#galeria", icon: FileImage, id: "galeria" },
  { label: "Secciones CMS", href: "/admin#cms_secciones", icon: Settings, id: "cms_secciones" },
  { label: "Contenido CMS", href: "/admin#cms_contenido", icon: FileText, id: "cms_contenido" },
  { label: "Descargas", href: "/admin#descargas", icon: Download, id: "descargas" },
  { label: "Reportes", href: "/admin#reportes", icon: Flag, id: "reportes" },
  { label: "Sanciones", href: "/admin#sanciones", icon: Gavel, id: "sanciones" },
  { label: "Tickets", href: "/admin#tickets", icon: LifeBuoy, id: "tickets" },
  { label: "Staff", href: "/admin#staff", icon: Users, id: "staff" },
  { label: "Configuración", href: "/admin#configuracion", icon: Settings, id: "configuracion" },
  { label: "Logs", href: "/admin#logs", icon: Logs, id: "logs" },
];

export function canAccessModule(role: AdminRole, moduleId: string) {
  return moduleId === "dashboard" || moduleRoles[moduleId]?.includes(role) === true;
}

export function canWriteModule(role: AdminRole, moduleId: string) {
  return moduleWriteRoles[moduleId]?.includes(role) === true;
}
