import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicMetricIcon = "users" | "online" | "guilds" | "events" | "history";
export type PublicVisualIcon =
  | "anchor"
  | "book"
  | "calendar"
  | "compass"
  | "crown"
  | "download"
  | "gamepad"
  | "gem"
  | "map"
  | "message"
  | "scroll"
  | "shield"
  | "skull"
  | "sparkles"
  | "swords"
  | "trophy"
  | "users"
  | "zap";

export type PublicMetric = {
  label: string;
  value: string;
  icon: PublicMetricIcon;
};

export type PublicNewsItem = {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
};

export type PublicEventItem = {
  id: string;
  title: string;
  date: string;
  reward: string;
  tone: string;
};

export type PublicLink = {
  label: string;
  href: string;
};

export type PublicSection = {
  eyebrow: string;
  title: string;
  text: string;
};

export type PublicFeature = {
  title: string;
  description: string;
  icon: PublicVisualIcon;
};

export type PublicCharacterPath = {
  key?: string;
  title: string;
  description: string;
};

export type PublicChapter = {
  eyebrow: string;
  title: string;
  icon: PublicVisualIcon;
};

export type PublicRankingItem = {
  id: string;
  name: string;
  level: string;
  clan: string;
  points: string;
  online: boolean;
};

export type PublicGalleryItem = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  category: string;
};

export type PublicFaqItem = {
  question: string;
  answer: string;
};

export type PublicConfig = {
  heroEyebrow: string;
  heroTagline: string;
  heroDescription: string;
  discordUrl: string;
  serverStatus: string;
  clientDownloadUrl: string;
  installationGuideUrl: string;
};

export type PublicEditorialContent = {
  navItems: PublicLink[];
  world: {
    cardTitle: string;
    cardText: string;
    section: PublicSection;
    tags: string[];
  };
  systemsSection: PublicSection;
  systems: PublicFeature[];
  pathsSection: PublicSection;
  paths: PublicCharacterPath[];
  chapters: PublicChapter[];
  rankingSection: PublicSection;
  ranking: PublicRankingItem[];
  eventsSection: PublicSection;
  downloadCta: {
    title: string;
    text: string;
    primaryLabel: string;
    guideLabel: string;
    requirements: string[];
  };
  trailer: PublicSection & {
    videoUrl: string;
    posterUrl: string;
  };
  gallerySection: PublicSection;
  gallery: PublicGalleryItem[];
  communityCta: {
    title: string;
    text: string;
    buttonLabel: string;
    buttonHref: string;
  };
  newsSection: PublicSection;
  faqSection: PublicSection;
  faqs: PublicFaqItem[];
  footer: {
    description: string;
    quickLinksTitle: string;
    communityLinksTitle: string;
    quickLinks: PublicLink[];
    communityLinks: PublicLink[];
    copyright: string;
  };
};

export type PublicContent = PublicEditorialContent & {
  news: PublicNewsItem[];
  events: PublicEventItem[];
  metrics: PublicMetric[];
  config: PublicConfig;
};

const fallbackMetrics: PublicMetric[] = [
  { label: "Identidades registradas", value: "18.420", icon: "users" },
  { label: "Jugadores TOP online", value: "327", icon: "online" },
  { label: "Facciones activas", value: "64", icon: "guilds" },
  { label: "Operaciones semanales", value: "12", icon: "events" },
  { label: "Años creando roleplay", value: "7", icon: "history" },
];

const fallbackNews: PublicNewsItem[] = [
  { id: "fallback-news-1", date: "06 Jun 2026", category: "Temporada", title: "Guerra de Territorios", summary: "Policías y bandas compiten por el control de las zonas más valiosas de la ciudad." },
  { id: "fallback-news-2", date: "04 Jun 2026", category: "Evento", title: "Operación Mercado Negro", summary: "Un contrabandista móvil apareció y todas las facciones buscan encontrarlo primero." },
  { id: "fallback-news-3", date: "01 Jun 2026", category: "Balance", title: "Wanted, Arrestos y Reputación", summary: "Nuevas reglas de búsqueda, recompensas policiales y progresión criminal." },
];

const eventTones = [
  "from-red-950 via-black to-gold-500/20",
  "from-yellow-900/40 via-black to-cyan-magic/20",
  "from-cyan-magic/20 via-black to-crimson/40",
  "from-gold-300/25 via-black to-red-950",
];

const fallbackEvents: PublicEventItem[] = [
  { id: "fallback-event-1", title: "Guerra Territorial", date: "Viernes 22:00", reward: "Control de zona, reputación y bonos de facción", tone: eventTones[0] },
  { id: "fallback-event-2", title: "Cargamento Ilegal", date: "Sábado 19:30", reward: "Dinero, contrabando y puntos territoriales", tone: eventTones[1] },
  { id: "fallback-event-3", title: "Fuga de Prisión", date: "Domingo 21:00", reward: "Reputación policial o criminal", tone: eventTones[2] },
  { id: "fallback-event-4", title: "Redada Policial", date: "Miércoles 20:00", reward: "Control policial y recompensas por arresto", tone: eventTones[3] },
];

const fallbackConfig: PublicConfig = {
  heroEyebrow: "Cops vs Gangs · Guerra de Territorios",
  heroTagline: "Policías, bandas y civiles construyen una ciudad que nunca deja de cambiar.",
  heroDescription: "Elige tu camino, gana reputación, controla territorios, participa en redadas, mueve contrabando y deja que cada acción transforme TOP ROLEPLAY.",
  discordUrl: "https://discord.com",
  serverStatus: "TOP ROLEPLAY online",
  clientDownloadUrl: "/downloads/top-roleplay-client.txt",
  installationGuideUrl: "/downloads/guia-instalacion.txt",
};

const fallbackEditorialContent: PublicEditorialContent = {
  navItems: [
    { label: "Inicio", href: "#inicio" },
    { label: "Ciudad", href: "#mundo" },
    { label: "Conflicto", href: "#sistemas" },
    { label: "Ranking", href: "/ranking" },
    { label: "Buscados", href: "/buscados" },
    { label: "Operaciones", href: "#eventos" },
    { label: "Jugar", href: "#descargas" },
    { label: "Comunidad", href: "#comunidad" },
  ],
  world: {
    cardTitle: "Una ciudad viva en conflicto",
    cardText: "Cada arresto, entrega ilegal, patrulla y guerra de zona altera el control de la ciudad en tiempo real.",
    section: {
      eyebrow: "TOP ROLEPLAY · Cops vs Gangs",
      title: "No entras solo a combatir. Entras a tomar una posición.",
      text: "Comienza como civil y decide tu futuro: servir a la Policía, crecer dentro de una banda, comerciar legalmente o moverte entre ambos mundos. Tu reputación, wanted level y facción cambian cómo la ciudad responde ante ti.",
    },
    tags: ["Policía", "Bandas", "Civiles"],
  },
  systemsSection: {
    eyebrow: "El corazón de TOP ROLEPLAY",
    title: "Una ciudad donde cada acción tiene consecuencias",
    text: "Territorios, wanted level, arrestos, contrabando, reputación y eventos automáticos mantienen el mundo siempre activo.",
  },
  systems: [
    { title: "Territorios Dinámicos", description: "Policía y bandas capturan zonas mediante actividad, misiones, arrestos, contrabando y presencia real.", icon: "map" },
    { title: "Wanted y Arrestos", description: "Cada crimen aumenta tu búsqueda. La Policía debe investigar, perseguir y arrestar sin abusar de civiles.", icon: "shield" },
    { title: "Contrabando y Economía", description: "Mercancías ilegales, rutas peligrosas, mercado negro y cargamentos crean riesgo y oportunidades.", icon: "gem" },
    { title: "Eventos Automáticos", description: "Redadas, fugas de prisión, guerras territoriales y cargamentos aparecen sin depender siempre del staff.", icon: "calendar" },
    { title: "Progresión por Facción", description: "Sube desde recluta o novato hasta comandante o líder, desbloqueando permisos y recompensas.", icon: "trophy" },
    { title: "Roleplay y Comunidad", description: "Civiles, informantes, comerciantes, policías y criminales crean historias más allá del PvP.", icon: "message" },
  ],
  pathsSection: {
    eyebrow: "Elige tu lugar en la ciudad",
    title: "Toda historia comienza como civil",
    text: "Conoce el mundo, completa tu introducción y decide a quién servir, ayudar o desafiar.",
  },
  paths: [
    { key: "argent_police_force", title: "Argent Police Force", description: "Patrulla zonas calientes, investiga, arresta criminales y dirige redadas para mantener el orden." },
    { key: "sea_shadow_syndicate", title: "Sea Shadow Syndicate", description: "Mueve contrabando por rutas ocultas y golpea desde las sombras sin dejar rastro." },
    { key: "abyssal_reavers", title: "Abyssal Reavers", description: "Saqueadores despiadados: asalta territorios, siembra el caos y toma lo que quieras por la fuerza." },
    { key: "crimson_tide_outlaws", title: "Crimson Tide Outlaws", description: "Forajidos sanguinarios que imponen su ley a sangre y fuego en cada esquina de la ciudad." },
    { key: "iron_skull_brotherhood", title: "Iron Skull Brotherhood", description: "Hermandad brutal y disciplinada que conquista zonas y no perdona a quien se cruce en su camino." },
    { key: "civil_comerciante", title: "Civil y Comerciante", description: "Trabaja, comercia, transporta y prospera sin entrar en la guerra... todavía." },
  ],
  chapters: [
    { eyebrow: "TOP ROLEPLAY · La ciudad", title: "Cada zona tiene dueño, actividad y una historia que puede cambiar hoy.", icon: "map" },
    { eyebrow: "TOP ROLEPLAY · Tu facción", title: "Policía, banda o civil: tu camino define tus aliados, riesgos y recompensas.", icon: "shield" },
    { eyebrow: "TOP ROLEPLAY · El conflicto", title: "Wanted, arrestos, redadas y contrabando convierten cada sesión en una decisión.", icon: "swords" },
    { eyebrow: "TOP ROLEPLAY · Tu legado", title: "Sube de rango, domina territorios y deja tu nombre en la temporada.", icon: "trophy" },
  ],
  rankingSection: {
    eyebrow: "El TOP de la comunidad",
    title: "Ranking TOP ROLEPLAY",
    text: "Mejor policía, criminal más buscado, banda dominante y figuras clave de la temporada.",
  },
  ranking: [
    { id: "fallback-ranking-1", name: "AurelioVega", level: "Comandante", clan: "Argent Police Force", points: "98.410", online: true },
    { id: "fallback-ranking-2", name: "MikaelRojas", level: "Mano Derecha", clan: "Sea Shadow Syndicate", points: "91.220", online: true },
    { id: "fallback-ranking-3", name: "NadiaCruz", level: "Jefe de Zona", clan: "Abyssal Reavers", points: "87.630", online: false },
    { id: "fallback-ranking-4", name: "BrunoNorte", level: "Lider", clan: "Crimson Tide Outlaws", points: "81.940", online: true },
    { id: "fallback-ranking-5", name: "LuciaMora", level: "Encargado", clan: "Iron Skull Brotherhood", points: "79.505", online: false },
  ],
  eventsSection: {
    eyebrow: "Centro de operaciones",
    title: "Conflictos activos en la ciudad",
    text: "Redadas, cargamentos, fugas y guerras territoriales cambian el control de la ciudad en tiempo real.",
  },
  downloadCta: {
    title: "Entra a TOP ROLEPLAY",
    text: "Descarga el cliente oficial, crea tu cuenta y comienza a construir una identidad que la comunidad recuerde.",
    primaryLabel: "Descargar Cliente",
    guideLabel: "Guía de Instalación",
    requirements: ["Windows 10/11", "4GB RAM mínimo", "2GB espacio disponible", "Internet estable"],
  },
  trailer: {
    eyebrow: "Cinemática TOP ROLEPLAY",
    title: "Mira el tráiler",
    text: "Una pieza breve para establecer tono, escudo y energía visual antes de entrar al juego.",
    videoUrl: "/Logo_reveal_animation_TOP_ROLEPLAY_202606061133.mp4",
    posterUrl: "/visuals/top/Scenes/Scene (5).png",
  },
  gallerySection: {
    eyebrow: "Galería",
    title: "El universo de TOP ROLEPLAY",
    text: "Territorios, redadas, bandas, patrullas y momentos decisivos de la comunidad.",
  },
  gallery: [
    { title: "Centro de la Ciudad", imageUrl: "/visuals/top/Panorama/Panorama (5).jpg" },
    { title: "Territorios", imageUrl: "/visuals/top/Scenes/Scene (2).png" },
    { title: "Redadas", imageUrl: "/visuals/top/Scenes/Scene (5).png" },
    { title: "Bandas", imageUrl: "/visuals/top/Wallpapers/Wallpapers (19).jpg" },
    { title: "Policía", imageUrl: "/visuals/top/2012_Update/NWS_4.png" },
    { title: "Mercado Negro", imageUrl: "/visuals/top/Wallpapers/Wallpapers (32).jpg" },
  ].map(({ title, imageUrl }, index) => ({
    id: `fallback-gallery-${index + 1}`,
    title,
    description: "Vista preparada para capturas oficiales del servidor.",
    imageUrl,
    category: "Galería",
  })),
  communityCta: {
    title: "Únete a TOP ROLEPLAY",
    text: "Recibe noticias, participa en eventos, reporta bugs, habla con el staff y encuentra compañeros de aventura.",
    buttonLabel: "Entrar al Discord",
    buttonHref: fallbackConfig.discordUrl,
  },
  newsSection: {
    eyebrow: "Bitácora oficial",
    title: "Noticias y actualizaciones",
    text: "Cambios, eventos, mantenimientos y novedades del servidor.",
  },
  faqSection: {
    eyebrow: "Soporte",
    title: "Preguntas frecuentes",
    text: "Respuestas rápidas para nuevos jugadores antes de entrar a la ciudad.",
  },
  faqs: [
    { question: "¿Cómo descargo el cliente?", answer: "Pulsa Descargar Cliente, revisa la guía incluida y entra con tu cuenta confirmada." },
    { question: "¿Cómo creo una cuenta?", answer: "Usa Crear Cuenta, registra tu nombre de jugador y confirma el correo si Supabase lo solicita." },
    { question: "¿El servidor es gratis?", answer: "Sí. TOP ROLEPLAY es gratis para jugar, con progresión, eventos y comunidad activa." },
    { question: "¿Dónde reporto bugs?", answer: "Entra al Discord y usa soporte o reportes. El staff revisa incidencias a diario." },
    { question: "¿Hay eventos automáticos?", answer: "Sí. Redadas, cargamentos ilegales, fugas de prisión y guerras territoriales aparecen regularmente." },
    { question: "¿Debo entrar directamente a una banda?", answer: "No. Todos comienzan como civiles y pueden conocer la ciudad antes de elegir una facción." },
  ],
  footer: {
    description: "Un mundo donde cada jugador puede crear identidad, reputación y una historia que merece llegar al TOP.",
    quickLinksTitle: "Links rápidos",
    communityLinksTitle: "Comunidad",
    quickLinks: [
      { label: "Inicio", href: "#inicio" },
      { label: "Ciudad", href: "#mundo" },
      { label: "Conflicto", href: "#sistemas" },
      { label: "Ranking", href: "/ranking" },
      { label: "Operaciones", href: "#eventos" },
    ],
    communityLinks: [
      { label: "Discord", href: "#comunidad" },
      { label: "Eventos", href: "#eventos" },
      { label: "Soporte", href: "#faq" },
      { label: "Panel Staff", href: "/admin/login" },
    ],
    copyright: "© 2026 TOP ROLEPLAY. Todos los derechos reservados.",
  },
};

export const fallbackPublicContent: PublicContent = {
  ...fallbackEditorialContent,
  news: fallbackNews,
  events: fallbackEvents,
  metrics: fallbackMetrics,
  config: fallbackConfig,
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const eventDateFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const visualIcons: PublicVisualIcon[] = ["anchor", "book", "calendar", "compass", "crown", "download", "gamepad", "gem", "map", "message", "scroll", "shield", "skull", "sparkles", "swords", "trophy", "users", "zap"];
const metricIconNames: PublicMetricIcon[] = ["users", "online", "guilds", "events", "history"];
const fallbackGalleryImages = [
  "/visuals/top/Panorama/Panorama (5).jpg",
  "/visuals/top/Scenes/Scene (2).png",
  "/visuals/top/Scenes/Scene (5).png",
  "/visuals/top/Wallpapers/Wallpapers (19).jpg",
  "/visuals/top/2012_Update/NWS_4.png",
  "/visuals/top/Wallpapers/Wallpapers (32).jpg",
];

function fallbackGalleryImage(title: string, index: number) {
  const normalized = title.toLowerCase();
  if (normalized.includes("territorio")) return "/visuals/top/Scenes/Scene (2).png";
  if (normalized.includes("redada") || normalized.includes("operacion") || normalized.includes("operación")) return "/visuals/top/Scenes/Scene (5).png";
  if (normalized.includes("banda") || normalized.includes("criminal")) return "/visuals/top/Wallpapers/Wallpapers (19).jpg";
  if (normalized.includes("polic")) return "/visuals/top/2012_Update/NWS_4.png";
  if (normalized.includes("mercado") || normalized.includes("contrabando")) return "/visuals/top/Wallpapers/Wallpapers (32).jpg";
  return fallbackGalleryImages[index % fallbackGalleryImages.length];
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function nonEmptyString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function displayString(value: unknown, fallback: string) {
  return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("es-ES") : nonEmptyString(value, fallback);
}

function safeHref(value: unknown, fallback: string) {
  const candidate = nonEmptyString(value, fallback);
  if ((candidate.startsWith("/") || candidate.startsWith("#")) && !/["'()\\\r\n]/.test(candidate)) return candidate;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

function parseConfig(value: unknown): PublicConfig {
  const config = objectValue(value);
  if (!config) return fallbackConfig;

  return {
    heroEyebrow: nonEmptyString(config.heroEyebrow, fallbackConfig.heroEyebrow),
    heroTagline: nonEmptyString(config.heroTagline, fallbackConfig.heroTagline),
    heroDescription: nonEmptyString(config.heroDescription, fallbackConfig.heroDescription),
    discordUrl: safeHref(config.discordUrl, fallbackConfig.discordUrl),
    serverStatus: nonEmptyString(config.serverStatus, fallbackConfig.serverStatus),
    clientDownloadUrl: safeHref(config.clientDownloadUrl, fallbackConfig.clientDownloadUrl),
    installationGuideUrl: safeHref(config.installationGuideUrl, fallbackConfig.installationGuideUrl),
  };
}

function parseMetrics(value: unknown): PublicMetric[] {
  if (!Array.isArray(value)) return fallbackMetrics;

  const metrics = value.flatMap((item) => {
    const metric = objectValue(item);
    const icon = String(metric?.icon);
    if (!metric || !metricIconNames.includes(icon as PublicMetricIcon)) return [];
    const label = nonEmptyString(metric.label, "");
    const metricValue = nonEmptyString(metric.value, "");
    return label && metricValue ? [{ label, value: metricValue, icon: icon as PublicMetricIcon }] : [];
  }).slice(0, 5);

  return metrics.length ? metrics : fallbackMetrics;
}

function parseSection(value: unknown, fallback: PublicSection): PublicSection {
  const section = objectValue(value);
  if (!section) return fallback;
  return {
    eyebrow: nonEmptyString(section.eyebrow, fallback.eyebrow),
    title: nonEmptyString(section.title, fallback.title),
    text: nonEmptyString(section.text, fallback.text),
  };
}

function parseStringList(value: unknown, fallback: string[], limit = 12) {
  if (!Array.isArray(value)) return fallback;
  const items = value.flatMap((item) => typeof item === "string" && item.trim() ? [item.trim()] : []).slice(0, limit);
  return items.length ? items : fallback;
}

function parseLinks(value: unknown, fallback: PublicLink[], limit = 12) {
  if (!Array.isArray(value)) return fallback;
  const links = value.flatMap((item) => {
    const link = objectValue(item);
    if (!link) return [];
    const label = nonEmptyString(link.label, "");
    const href = safeHref(link.href, "");
    return label && href ? [{ label, href }] : [];
  }).slice(0, limit);
  return links.length ? links : fallback;
}

function parseFeatures(value: unknown) {
  if (!Array.isArray(value)) return fallbackEditorialContent.systems;
  const features = value.flatMap((item) => {
    const feature = objectValue(item);
    const icon = String(feature?.icon);
    if (!feature || !visualIcons.includes(icon as PublicVisualIcon)) return [];
    const title = nonEmptyString(feature.title, "");
    const description = nonEmptyString(feature.description, "");
    return title && description ? [{ title, description, icon: icon as PublicVisualIcon }] : [];
  }).slice(0, 12);
  return features.length ? features : fallbackEditorialContent.systems;
}

function parsePaths(value: unknown) {
  if (!Array.isArray(value)) return fallbackEditorialContent.paths;
  const paths = value.flatMap((item, index) => {
    if (typeof item === "string" && item.trim()) {
      return [{ key: `path-${index}`, title: item.trim(), description: fallbackEditorialContent.paths[0].description }];
    }
    const path = objectValue(item);
    if (!path) return [];
    const title = nonEmptyString(path.title, "");
    return title ? [{ key: nonEmptyString(path.key, `path-${index}`), title, description: nonEmptyString(path.description, fallbackEditorialContent.paths[0].description) }] : [];
  }).slice(0, 12);
  return paths.length ? paths : fallbackEditorialContent.paths;
}

function parseChapters(value: unknown) {
  if (!Array.isArray(value)) return fallbackEditorialContent.chapters;
  const chapters = value.flatMap((item, index) => {
    const chapter = objectValue(item);
    const fallback = fallbackEditorialContent.chapters[index] ?? fallbackEditorialContent.chapters.at(-1)!;
    if (!chapter) return [];
    const icon = visualIcons.includes(String(chapter.icon) as PublicVisualIcon) ? String(chapter.icon) as PublicVisualIcon : fallback.icon;
    const title = nonEmptyString(chapter.title, "");
    return title ? [{ eyebrow: nonEmptyString(chapter.eyebrow, fallback.eyebrow), title, icon }] : [];
  }).slice(0, 8);
  return chapters.length ? chapters : fallbackEditorialContent.chapters;
}

function parseRanking(value: unknown): PublicRankingItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const player = objectValue(item);
    if (!player) return [];
    const name = nonEmptyString(player.name, "");
    if (!name) return [];
    return [{
      id: nonEmptyString(player.id, `cms-ranking-${index + 1}`),
      name,
      level: displayString(player.level, "—"),
      clan: nonEmptyString(player.clan, "Sin facción"),
      points: displayString(player.points, "0"),
      online: player.online === true,
    }];
  }).slice(0, 10);
}

// Nombres de rango reales del juego (faction_system.lua POLICE_RANKS / GANG_RANKS).
const POLICE_RANK_NAMES = ["Recluta", "Oficial", "Cabo", "Sargento", "Teniente", "Capitan", "Comandante"];
const GANG_RANK_NAMES = ["Novato", "Mensajero", "Sicario", "Encargado", "Jefe de Zona", "Mano Derecha", "Lider"];

function liveRankName(faction: number, rank: number): string {
  if (faction === 1) return POLICE_RANK_NAMES[rank] ?? "Recluta";
  if (faction >= 2 && faction <= 5) return GANG_RANK_NAMES[rank] ?? "Novato";
  return "Ciudadano";
}

// Ranking REAL desde live_characters (puente SQL Server): top por reputacion.
function liveCharacterRanking(value: unknown): PublicRankingItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const character = objectValue(item);
    if (!character) return [];
    const name = nonEmptyString(character.cha_name, "");
    if (!name) return [];
    const faction = Number(character.faction ?? 0);
    const rank = Number(character.faction_rank ?? 0);
    const rep = Number(character.reputation_points ?? 0);
    return [{
      id: `live-char-${character.cha_id ?? index + 1}`,
      name,
      level: liveRankName(faction, rank),
      clan: nonEmptyString(character.faction_name, "Civil"),
      points: (Number.isFinite(rep) ? rep : 0).toLocaleString("es-ES"),
      online: false,
    }];
  }).slice(0, 5);
}

function parseGallery(value: unknown): PublicGalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const galleryItem = objectValue(item);
    if (!galleryItem) return [];
    const title = nonEmptyString(galleryItem.title, "");
    if (!title) return [];
    return [{
      id: nonEmptyString(galleryItem.id, `cms-gallery-${index + 1}`),
      title,
      description: nonEmptyString(galleryItem.description, "Vista preparada para capturas oficiales del servidor."),
      imageUrl: galleryItem.imageUrl ? safeHref(galleryItem.imageUrl, fallbackGalleryImage(title, index)) : fallbackGalleryImage(title, index),
      category: nonEmptyString(galleryItem.category, "Galería"),
    }];
  }).slice(0, 12);
}

function parseFaqs(value: unknown) {
  if (!Array.isArray(value)) return fallbackEditorialContent.faqs;
  const faqs = value.flatMap((item) => {
    const faq = objectValue(item);
    if (!faq) return [];
    const question = nonEmptyString(faq.question, "");
    const answer = nonEmptyString(faq.answer, "");
    return question && answer ? [{ question, answer }] : [];
  }).slice(0, 20);
  return faqs.length ? faqs : fallbackEditorialContent.faqs;
}

function parseEditorialContent(value: unknown, tableRanking: PublicRankingItem[], tableGallery: PublicGalleryItem[]): PublicEditorialContent {
  const content = objectValue(value);
  if (!content) {
    return {
      ...fallbackEditorialContent,
      ranking: tableRanking.length ? tableRanking : fallbackEditorialContent.ranking,
      gallery: tableGallery.length ? tableGallery : fallbackEditorialContent.gallery,
    };
  }

  const world = objectValue(content.world);
  const downloadCta = objectValue(content.downloadCta);
  const trailer = objectValue(content.trailer);
  const communityCta = objectValue(content.communityCta);
  const footer = objectValue(content.footer);
  const cmsRanking = parseRanking(content.ranking);
  const cmsGallery = parseGallery(content.gallery);

  return {
    navItems: parseLinks(content.navItems, fallbackEditorialContent.navItems),
    world: {
      cardTitle: nonEmptyString(world?.cardTitle, fallbackEditorialContent.world.cardTitle),
      cardText: nonEmptyString(world?.cardText, fallbackEditorialContent.world.cardText),
      section: parseSection(world?.section, fallbackEditorialContent.world.section),
      tags: parseStringList(world?.tags, fallbackEditorialContent.world.tags, 6),
    },
    systemsSection: parseSection(content.systemsSection, fallbackEditorialContent.systemsSection),
    systems: parseFeatures(content.systems),
    pathsSection: parseSection(content.pathsSection, fallbackEditorialContent.pathsSection),
    paths: parsePaths(content.paths),
    chapters: parseChapters(content.chapters),
    rankingSection: parseSection(content.rankingSection, fallbackEditorialContent.rankingSection),
    ranking: cmsRanking.length ? cmsRanking : tableRanking.length ? tableRanking : fallbackEditorialContent.ranking,
    eventsSection: parseSection(content.eventsSection, fallbackEditorialContent.eventsSection),
    downloadCta: {
      title: nonEmptyString(downloadCta?.title, fallbackEditorialContent.downloadCta.title),
      text: nonEmptyString(downloadCta?.text, fallbackEditorialContent.downloadCta.text),
      primaryLabel: nonEmptyString(downloadCta?.primaryLabel, fallbackEditorialContent.downloadCta.primaryLabel),
      guideLabel: nonEmptyString(downloadCta?.guideLabel, fallbackEditorialContent.downloadCta.guideLabel),
      requirements: parseStringList(downloadCta?.requirements, fallbackEditorialContent.downloadCta.requirements, 8),
    },
    trailer: {
      ...parseSection(trailer, fallbackEditorialContent.trailer),
      videoUrl: safeHref(trailer?.videoUrl, fallbackEditorialContent.trailer.videoUrl),
      posterUrl: safeHref(trailer?.posterUrl, fallbackEditorialContent.trailer.posterUrl),
    },
    gallerySection: parseSection(content.gallerySection, fallbackEditorialContent.gallerySection),
    gallery: cmsGallery.length ? cmsGallery : tableGallery.length ? tableGallery : fallbackEditorialContent.gallery,
    communityCta: {
      title: nonEmptyString(communityCta?.title, fallbackEditorialContent.communityCta.title),
      text: nonEmptyString(communityCta?.text, fallbackEditorialContent.communityCta.text),
      buttonLabel: nonEmptyString(communityCta?.buttonLabel, fallbackEditorialContent.communityCta.buttonLabel),
      buttonHref: safeHref(communityCta?.buttonHref, fallbackEditorialContent.communityCta.buttonHref),
    },
    newsSection: parseSection(content.newsSection, fallbackEditorialContent.newsSection),
    faqSection: parseSection(content.faqSection, fallbackEditorialContent.faqSection),
    faqs: parseFaqs(content.faqs),
    footer: {
      description: nonEmptyString(footer?.description, fallbackEditorialContent.footer.description),
      quickLinksTitle: nonEmptyString(footer?.quickLinksTitle, fallbackEditorialContent.footer.quickLinksTitle),
      communityLinksTitle: nonEmptyString(footer?.communityLinksTitle, fallbackEditorialContent.footer.communityLinksTitle),
      quickLinks: parseLinks(footer?.quickLinks, fallbackEditorialContent.footer.quickLinks),
      communityLinks: parseLinks(footer?.communityLinks, fallbackEditorialContent.footer.communityLinks),
      copyright: nonEmptyString(footer?.copyright, fallbackEditorialContent.footer.copyright),
    },
  };
}

function tableRankingItems(value: unknown): PublicRankingItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const ranking = objectValue(item);
    if (!ranking) return [];
    const player = objectValue(ranking.players);
    const guild = objectValue(ranking.guilds);
    const name = nonEmptyString(player?.username, nonEmptyString(guild?.name, ""));
    if (!name) return [];
    const points = typeof ranking.points === "number" ? ranking.points.toLocaleString("es-ES") : nonEmptyString(ranking.points, "");
    if (!points) return [];
    return [{
      id: nonEmptyString(ranking.id, `table-ranking-${index + 1}`),
      name,
      level: "—",
      clan: nonEmptyString(guild?.name, nonEmptyString(ranking.ranking_type, "General")),
      points,
      online: false,
    }];
  }).slice(0, 5);
}

function tableGalleryItems(value: unknown): PublicGalleryItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const galleryItem = objectValue(item);
    if (!galleryItem) return [];
    const title = nonEmptyString(galleryItem.title, "");
    if (!title) return [];
    return [{
      id: nonEmptyString(galleryItem.id, `table-gallery-${index + 1}`),
      title,
      description: nonEmptyString(galleryItem.description, "Captura oficial de TOP ROLEPLAY."),
      imageUrl: galleryItem.image_url ? safeHref(galleryItem.image_url, fallbackGalleryImage(title, index)) : fallbackGalleryImage(title, index),
      category: nonEmptyString(galleryItem.category, "Galería"),
    }];
  }).slice(0, 12);
}

function viewEditorialPayload(value: unknown): Record<string, unknown> | null {
  if (!Array.isArray(value) || !value.length) return null;
  const sections = new Map<string, Record<string, unknown>>();
  for (const row of value) {
    const section = objectValue(row);
    if (section && typeof section.key === "string") sections.set(section.key, section);
  }
  const items = (key: string) => Array.isArray(sections.get(key)?.items) ? sections.get(key)!.items as Record<string, unknown>[] : [];
  const metadata = (key: string) => objectValue(sections.get(key)?.metadata) ?? {};
  const first = (key: string) => items(key)[0] ?? {};
  const sectionCopy = (key: string) => ({
    eyebrow: metadata(key).eyebrow,
    title: metadata(key).headline ?? sections.get(key)?.title,
    text: sections.get(key)?.description,
  });

  const worldItems = items("world");
  const worldCard = worldItems.find((item) => item.type === "card") ?? {};
  const worldText = worldItems.find((item) => item.type === "text") ?? {};
  const trailer = first("trailer_media");
  const community = first("community_cta");
  const downloadItems = items("downloads_public");
  const footerItems = items("footer_public");
  const footerBrand = footerItems.find((item) => item.key === "brand") ?? {};

  return {
    navItems: items("navigation").map((item) => ({ label: item.title, href: item.href })),
    world: {
      cardTitle: worldCard.title,
      cardText: worldCard.body,
      section: { eyebrow: worldText.subtitle, title: worldText.title, text: worldText.body },
      tags: objectValue(worldText.data)?.tags,
    },
    systemsSection: sectionCopy("systems"),
    systems: items("systems").map((item) => ({ title: item.title, description: item.body, icon: String(item.icon ?? "").toLowerCase().replace("bookopen", "book").replace("scrolltext", "scroll").replace("messagecircle", "message") })),
    pathsSection: sectionCopy("character_paths"),
    paths: items("character_paths").map((item) => ({ key: item.key, title: item.title, description: item.body })),
    chapters: items("parallax_chapters").map((item) => ({ eyebrow: item.subtitle, title: item.title, icon: String(item.icon ?? "").toLowerCase() })),
    rankingSection: sectionCopy("ranking_public"),
    eventsSection: sectionCopy("events_public"),
    downloadCta: {
      title: downloadItems[0]?.title,
      text: downloadItems[0]?.body,
      requirements: downloadItems.filter((item) => item.type === "requirement").map((item) => item.title),
    },
    trailer: {
      eyebrow: metadata("trailer_media").eyebrow,
      title: trailer.title,
      text: trailer.subtitle,
      videoUrl: trailer.mediaUrl,
      posterUrl: objectValue(trailer.data)?.poster,
    },
    gallerySection: sectionCopy("gallery_public"),
    communityCta: { title: community.title, text: community.body, buttonLabel: community.subtitle, buttonHref: community.href },
    newsSection: {
      eyebrow: first("news_public").subtitle ?? metadata("news_public").eyebrow,
      title: first("news_public").title ?? sections.get("news_public")?.title,
      text: first("news_public").body ?? sections.get("news_public")?.description,
    },
    faqSection: sectionCopy("faq_public"),
    faqs: items("faq_public").map((item) => ({ question: item.title, answer: item.body })),
    footer: {
      description: footerBrand.body,
      quickLinks: footerItems.filter((item) => objectValue(item.data)?.group === "Links rápidos").map((item) => ({ label: item.title, href: item.href })),
      communityLinks: footerItems.filter((item) => objectValue(item.data)?.group === "Comunidad").map((item) => ({ label: item.title, href: item.href })),
      copyright: footerItems.find((item) => objectValue(item.data)?.group === "Legal")?.title,
    },
  };
}

export async function getPublicContent(): Promise<PublicContent> {
  try {
    const supabase = await createSupabaseServerClient();
    const now = new Date().toISOString();
    const [newsResult, eventsResult, settingsResult, rankingsResult, galleryResult, pageContentResult, liveCharsResult] = await Promise.all([
      supabase.from("news").select("id,title,category,summary,published_at").eq("status", "publicado").lte("published_at", now).order("published_at", { ascending: false }).limit(3),
      supabase.from("events").select("id,name,rewards,starts_at").in("status", ["activo", "destacado"]).or(`ends_at.is.null,ends_at.gte.${now}`).order("is_featured", { ascending: false }).order("starts_at", { ascending: true }).limit(4),
      supabase.from("site_settings").select("key,value").in("key", ["public_config", "public_metrics", "public_content"]),
      supabase.from("rankings").select("id,ranking_type,points,is_featured,players(username),guilds(name)").eq("is_visible", true).order("is_featured", { ascending: false }).order("points", { ascending: false }).limit(5),
      supabase.from("gallery").select("id,title,description,image_url,category,is_featured,sort_order").eq("is_active", true).order("is_featured", { ascending: false }).order("sort_order", { ascending: true }).limit(12),
      supabase.from("public_page_content").select("*"),
      supabase.from("live_characters").select("cha_id,cha_name,faction,faction_name,faction_rank,reputation_points").order("reputation_points", { ascending: false }).limit(5),
    ]);

    const news = newsResult.error || !newsResult.data?.length
      ? fallbackNews
      : newsResult.data.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          summary: item.summary,
          date: dateFormatter.format(new Date(item.published_at)),
        }));

    const events = eventsResult.error || !eventsResult.data?.length
      ? fallbackEvents
      : eventsResult.data.map((item, index) => ({
          id: item.id,
          title: item.name,
          date: eventDateFormatter.format(new Date(item.starts_at)),
          reward: nonEmptyString(item.rewards, "Recompensas anunciadas por el staff"),
          tone: eventTones[index % eventTones.length],
        }));

    const settings = new Map((settingsResult.data ?? []).map((item) => [item.key, item.value]));
    const config = settingsResult.error ? fallbackConfig : parseConfig(settings.get("public_config"));
    const editorial = parseEditorialContent(
      settingsResult.error ? viewEditorialPayload(pageContentResult.data) : settings.get("public_content") ?? viewEditorialPayload(pageContentResult.data),
      rankingsResult.error ? [] : tableRankingItems(rankingsResult.data),
      galleryResult.error ? [] : tableGalleryItems(galleryResult.data),
    );

    // Ranking REAL del juego (live_characters via puente SQL Server) tiene prioridad
    // sobre CMS/tabla editorial/fallback en la seccion de ranking de la landing.
    const liveRanking = liveCharsResult.error ? [] : liveCharacterRanking(liveCharsResult.data);

    // Garantiza los enlaces en vivo (ranking + buscados) aunque el nav venga del CMS.
    const withRanking = editorial.navItems.some((item) => item.href === "/ranking")
      ? editorial.navItems
      : [...editorial.navItems.slice(0, 3), { label: "Ranking", href: "/ranking" }, ...editorial.navItems.slice(3)];
    const rankingIndex = withRanking.findIndex((item) => item.href === "/ranking");
    const navItems = withRanking.some((item) => item.href === "/buscados")
      ? withRanking
      : [...withRanking.slice(0, rankingIndex + 1), { label: "Buscados", href: "/buscados" }, ...withRanking.slice(rankingIndex + 1)];

    return {
      ...editorial,
      navItems,
      ranking: liveRanking.length ? liveRanking : editorial.ranking,
      communityCta: {
        ...editorial.communityCta,
        buttonHref: editorial.communityCta.buttonHref === fallbackConfig.discordUrl ? config.discordUrl : editorial.communityCta.buttonHref,
      },
      news,
      events,
      metrics: settingsResult.error ? fallbackMetrics : parseMetrics(settings.get("public_metrics")),
      config,
    };
  } catch {
    return fallbackPublicContent;
  }
}
