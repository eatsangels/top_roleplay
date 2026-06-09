import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { moduleWriteRoles, rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { isAdminRecordId } from "@/lib/admin-forms";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const moduleConfig: Record<string, { table: string; statuses: string[] }> = {
  jugadores: { table: "players", statuses: ["activo", "pendiente", "suspendido", "baneado"] },
  personajes: { table: "characters", statuses: ["activo", "bloqueado"] },
  clanes: { table: "guilds", statuses: ["activo", "inactivo"] },
  noticias: { table: "news", statuses: ["borrador", "publicado", "archivado"] },
  eventos: { table: "events", statuses: ["activo", "destacado", "cancelado", "finalizado"] },
  descargas: { table: "downloads", statuses: ["activo", "inactivo"] },
  reportes: { table: "reports", statuses: ["pendiente", "en_revision", "resuelto", "rechazado"] },
  tickets: { table: "tickets", statuses: ["pendiente", "en_revision", "resuelto", "rechazado", "cerrado"] },
};

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin?error=invalid-origin");

  const formData = await request.formData();
  const moduleId = String(formData.get("module") ?? "");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const config = moduleConfig[moduleId];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !config || !isAdminRecordId(id) || !config.statuses.includes(status)) {
    return relativeRedirect("/admin");
  }

  const { data: roleRecord } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = roleRecord?.role as AdminRole | undefined;
  if (!role || !moduleWriteRoles[moduleId]?.includes(role)) {
    return relativeRedirect("/admin");
  }

  const updates: Record<string, unknown> = { status };
  if (moduleId === "noticias") {
    const { data: currentNews } = await supabase.from(config.table).select("published_at").eq("id", id).maybeSingle();
    updates.published_at = status === "publicado" ? currentNews?.published_at ?? new Date().toISOString() : null;
  }
  if (moduleId === "eventos") updates.is_featured = status === "destacado";

  const { data, error } = await supabase.from(config.table).update(updates).eq("id", id).select("id").maybeSingle();
  if (error || !data) {
    console.error("admin record-status failed", { moduleId, id, status, userId: user.id, error: error?.message });
    return relativeRedirect(`${rolePanelPaths[role]}?error=status-update-failed&module=${encodeURIComponent(moduleId)}#${moduleId}`);
  }

  const { error: logError } = await supabase.from("admin_logs").insert({
    admin_user_id: user.id,
    action: `Actualizó estado a ${status}`,
    module: moduleId,
    details: { record_id: id },
  });
  if (logError) console.error("admin record-status log failed", { moduleId, id, userId: user.id, error: logError.message });

  return relativeRedirect(`${rolePanelPaths[role]}?result=status-updated&module=${encodeURIComponent(moduleId)}#${moduleId}`);
}
