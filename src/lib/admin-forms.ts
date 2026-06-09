export type AdminFormOption = {
  label: string;
  value: string;
};

export type AdminFormField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "datetime-local" | "number" | "select" | "url";
  valueType?: "boolean" | "integer" | "uuid";
  required?: boolean;
  nullable?: boolean;
  options?: AdminFormOption[];
  optionSource?: "players" | "guilds" | "public_sections";
  placeholder?: string;
  help?: string;
  min?: number;
  max?: number;
  defaultValue?: string;
};

export type AdminRecordForm = {
  title: string;
  editTitle: string;
  table: string;
  fields: AdminFormField[];
};

const option = (value: string, label = value): AdminFormOption => ({ label, value });
const statuses = (...values: string[]) => values.map((value) => option(value));
const booleanOptions = [option("true", "Sí"), option("false", "No")];

export const adminRecordForms: Record<string, AdminRecordForm> = {
  clanes: {
    title: "Crear clan",
    editTitle: "Editar clan",
    table: "guilds",
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "status", label: "Estado", type: "select", options: statuses("activo", "inactivo"), required: true, defaultValue: "activo" },
    ],
  },
  ranking: {
    title: "Crear entrada de ranking",
    editTitle: "Editar entrada de ranking",
    table: "rankings",
    fields: [
      { name: "player_id", label: "Jugador", type: "select", valueType: "uuid", nullable: true, optionSource: "players", help: "Selecciona jugador o clan, pero no ambos." },
      { name: "guild_id", label: "Clan", type: "select", valueType: "uuid", nullable: true, optionSource: "guilds" },
      { name: "ranking_type", label: "Tipo de ranking", required: true, placeholder: "general, territorios, facciones..." },
      { name: "points", label: "Puntos", type: "number", valueType: "integer", required: true, min: 0, defaultValue: "0" },
      { name: "is_featured", label: "Destacado", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "false" },
      { name: "is_visible", label: "Visible públicamente", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "true" },
    ],
  },
  noticias: {
    title: "Crear noticia",
    editTitle: "Editar noticia",
    table: "news",
    fields: [
      { name: "title", label: "Título", required: true },
      { name: "slug", label: "Slug", required: true, placeholder: "nombre-de-la-noticia", help: "Solo letras minúsculas, números y guiones." },
      { name: "category", label: "Categoría", required: true },
      { name: "featured_image_url", label: "Imagen destacada", type: "url", nullable: true, placeholder: "https://..." },
      { name: "summary", label: "Resumen", type: "textarea", required: true },
      { name: "content", label: "Contenido", type: "textarea", required: true },
      { name: "seo_title", label: "Título SEO", nullable: true, placeholder: "Título mostrado en buscadores" },
      { name: "seo_description", label: "Descripción SEO", type: "textarea", nullable: true, placeholder: "Resumen para buscadores y redes" },
      { name: "status", label: "Estado", type: "select", options: statuses("borrador", "publicado", "archivado"), required: true, defaultValue: "borrador" },
    ],
  },
  eventos: {
    title: "Crear evento",
    editTitle: "Editar evento",
    table: "events",
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "slug", label: "Slug", required: true, placeholder: "nombre-del-evento", help: "Solo letras minúsculas, números y guiones." },
      { name: "image_url", label: "Imagen del evento", type: "url", nullable: true, placeholder: "https://..." },
      { name: "description", label: "Descripción", type: "textarea", required: true },
      { name: "starts_at", label: "Fecha de inicio", type: "datetime-local", required: true },
      { name: "ends_at", label: "Fecha de finalización", type: "datetime-local", nullable: true },
      { name: "event_type", label: "Tipo de evento", required: true },
      { name: "rewards", label: "Recompensas", type: "textarea", nullable: true },
      { name: "rules", label: "Reglas", type: "textarea", nullable: true },
      { name: "status", label: "Estado", type: "select", options: statuses("activo", "destacado", "cancelado", "finalizado"), required: true, defaultValue: "activo" },
    ],
  },
  galeria: {
    title: "Añadir imagen",
    editTitle: "Editar imagen",
    table: "gallery",
    fields: [
      { name: "title", label: "Título", required: true },
      { name: "description", label: "Descripción", type: "textarea", nullable: true },
      { name: "image_url", label: "URL de imagen", type: "url", placeholder: "https://...", required: true },
      { name: "category", label: "Categoría", required: true },
      { name: "is_active", label: "Activa", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "true" },
      { name: "is_featured", label: "Destacada", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "false" },
      { name: "sort_order", label: "Orden", type: "number", valueType: "integer", required: true, min: 0, defaultValue: "0" },
    ],
  },
  cms_secciones: {
    title: "Crear sección pública",
    editTitle: "Editar sección pública",
    table: "public_sections",
    fields: [
      { name: "key", label: "Clave", required: true, placeholder: "systems", help: "Identificador único en minúsculas, números, guiones o guion bajo." },
      { name: "title", label: "Título", required: true },
      { name: "description", label: "Descripción", type: "textarea", nullable: true },
      { name: "section_type", label: "Tipo", type: "select", options: statuses("navigation", "hero", "world", "systems", "character_paths", "parallax", "ranking", "events", "downloads", "media", "gallery", "community", "news", "faq", "footer", "custom"), required: true },
      { name: "location", label: "Ubicación", required: true, defaultValue: "landing" },
      { name: "sort_order", label: "Orden", type: "number", valueType: "integer", required: true, min: 0, defaultValue: "0" },
      { name: "status", label: "Estado", type: "select", options: statuses("borrador", "publicado", "archivado"), required: true, defaultValue: "publicado" },
      { name: "is_active", label: "Activa", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "true" },
    ],
  },
  cms_contenido: {
    title: "Crear contenido público",
    editTitle: "Editar contenido público",
    table: "public_content",
    fields: [
      { name: "section_id", label: "Sección", type: "select", valueType: "uuid", optionSource: "public_sections", required: true },
      { name: "key", label: "Clave", required: true, placeholder: "feature_1", help: "Única dentro de la sección." },
      { name: "content_type", label: "Tipo de contenido", type: "select", options: statuses("link", "cta", "card", "feature", "path", "chapter", "ranking_snapshot", "requirement", "media", "text", "faq", "custom"), required: true },
      { name: "title", label: "Título", nullable: true },
      { name: "subtitle", label: "Subtítulo", nullable: true },
      { name: "body", label: "Cuerpo", type: "textarea", nullable: true },
      { name: "href", label: "Enlace", nullable: true, placeholder: "#seccion, /ruta o https://..." },
      { name: "media_url", label: "URL de media", nullable: true, placeholder: "/archivo.png o https://..." },
      { name: "media_type", label: "Tipo de media", type: "select", options: statuses("", "image", "video", "audio", "download"), nullable: true },
      { name: "icon", label: "Icono", nullable: true, placeholder: "anchor, book, swords..." },
      { name: "sort_order", label: "Orden", type: "number", valueType: "integer", required: true, min: 0, defaultValue: "0" },
      { name: "status", label: "Estado", type: "select", options: statuses("borrador", "publicado", "archivado"), required: true, defaultValue: "publicado" },
      { name: "is_active", label: "Activo", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "true" },
    ],
  },
  descargas: {
    title: "Crear descarga",
    editTitle: "Editar descarga",
    table: "downloads",
    fields: [
      { name: "name", label: "Nombre", required: true },
      { name: "version", label: "Versión", required: true },
      { name: "download_url", label: "URL de descarga", type: "url", placeholder: "https://...", required: true },
      { name: "file_size", label: "Tamaño", nullable: true },
      { name: "download_type", label: "Tipo", type: "select", options: statuses("cliente completo", "parche", "launcher", "guía"), required: true },
      { name: "release_notes", label: "Notas de versión", type: "textarea", nullable: true },
      { name: "status", label: "Estado", type: "select", options: statuses("activo", "inactivo"), required: true, defaultValue: "activo" },
      { name: "is_primary", label: "Descarga principal", type: "select", valueType: "boolean", options: booleanOptions, required: true, defaultValue: "false" },
    ],
  },
  sanciones: {
    title: "Crear sanción",
    editTitle: "Editar sanción",
    table: "sanctions",
    fields: [
      { name: "player_id", label: "Jugador", type: "select", valueType: "uuid", optionSource: "players", required: true },
      { name: "sanction_type", label: "Tipo de sanción", type: "select", options: statuses("advertencia", "mute", "suspensión", "baneo"), required: true },
      { name: "reason", label: "Motivo", type: "textarea", required: true },
      { name: "expires_at", label: "Expira", type: "datetime-local", nullable: true, help: "Déjalo vacío para una sanción sin vencimiento." },
      { name: "revoked_at", label: "Revocada", type: "datetime-local", nullable: true, help: "Completa este campo solo si la sanción fue revocada." },
    ],
  },
};

export const adminCreateForms = adminRecordForms;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseAdminRecordForm(moduleId: string, formData: FormData) {
  const form = adminRecordForms[moduleId];
  if (!form) return { error: "Módulo no permitido.", record: null };

  const record: Record<string, unknown> = {};
  for (const field of form.fields) {
    const value = String(formData.get(field.name) ?? "").trim();

    if (!value) {
      if (field.required) return { error: `${field.label} es obligatorio.`, record: null };
      if (field.nullable) record[field.name] = null;
      continue;
    }

    if (field.options && !field.options.some((item) => item.value === value)) {
      return { error: `${field.label} no es válido.`, record: null };
    }
    if ((field.name === "slug" || field.name === "key") && !slugPattern.test(value.replaceAll("_", "-"))) {
      return { error: "El slug solo puede contener minúsculas, números y guiones.", record: null };
    }
    if (field.type === "url" && !isHttpUrl(value)) {
      return { error: `${field.label} debe ser una URL HTTP o HTTPS.`, record: null };
    }
    if (field.type === "datetime-local") {
      const timestamp = Date.parse(value);
      if (Number.isNaN(timestamp)) return { error: `${field.label} no contiene una fecha válida.`, record: null };
      record[field.name] = new Date(timestamp).toISOString();
      continue;
    }
    if (field.valueType === "uuid" && !uuidPattern.test(value)) {
      return { error: `${field.label} no contiene un identificador válido.`, record: null };
    }
    if (field.valueType === "integer") {
      const number = Number(value);
      if (!Number.isSafeInteger(number) || (field.min !== undefined && number < field.min) || (field.max !== undefined && number > field.max)) {
        return { error: `${field.label} no contiene un número válido.`, record: null };
      }
      record[field.name] = number;
      continue;
    }
    if (field.valueType === "boolean") {
      record[field.name] = value === "true";
      continue;
    }

    record[field.name] = value;
  }

  if (moduleId === "ranking" && Boolean(record.player_id) === Boolean(record.guild_id)) {
    return { error: "Selecciona exactamente un jugador o un clan para el ranking.", record: null };
  }
  if (moduleId === "eventos" && record.starts_at && record.ends_at && Date.parse(String(record.ends_at)) < Date.parse(String(record.starts_at))) {
    return { error: "La fecha de finalización no puede ser anterior al inicio.", record: null };
  }

  return { error: null, record };
}

export function isAdminRecordId(value: string) {
  return uuidPattern.test(value);
}

export function applyAdminManagedFields(moduleId: string, record: Record<string, unknown>, userId: string, mode: "create" | "update") {
  if (moduleId === "noticias") {
    if (mode === "create") record.author_id = userId;
    record.published_at = record.status === "publicado" ? new Date().toISOString() : null;
  }
  if (moduleId === "eventos") record.is_featured = record.status === "destacado";
  if (moduleId === "sanciones" && mode === "create") record.issued_by = userId;
  if (moduleId === "ranking") record.updated_at = new Date().toISOString();
  if (moduleId === "descargas") record.updated_file_at = new Date().toISOString();
  return record;
}
