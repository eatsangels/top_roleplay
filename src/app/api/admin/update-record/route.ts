import { moduleWriteRoles, rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { adminRecordForms, applyAdminManagedFields, isAdminRecordId, parseAdminRecordForm } from "@/lib/admin-forms";
import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function editRecordPath(moduleId: string, id: string, error: string) {
  return `/admin/editar/${moduleId}/${id}?error=${encodeURIComponent(error)}`;
}

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin?error=invalid-origin");

  const formData = await request.formData();
  const moduleId = String(formData.get("module") ?? "");
  const id = String(formData.get("id") ?? "");
  const form = adminRecordForms[moduleId];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !form || !isAdminRecordId(id)) return relativeRedirect("/admin");

  const { data: roleRecord } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = roleRecord?.role as AdminRole | undefined;
  if (!role || !moduleWriteRoles[moduleId]?.includes(role)) return relativeRedirect("/admin?error=unauthorized");

  const parsed = parseAdminRecordForm(moduleId, formData);
  if (!parsed.record) return relativeRedirect(editRecordPath(moduleId, id, parsed.error ?? "Datos no válidos."));

  const { data: existingNews } = moduleId === "noticias"
    ? await supabase.from(form.table).select("status,published_at").eq("id", id).maybeSingle()
    : { data: null };
  const record = applyAdminManagedFields(moduleId, parsed.record, user.id, "update");
  if (moduleId === "noticias" && record.status === "publicado" && existingNews?.status === "publicado" && existingNews.published_at) {
    record.published_at = existingNews.published_at;
  }
  const { data, error } = await supabase.from(form.table).update(record).eq("id", id).select("id").maybeSingle();
  if (error || !data) {
    console.error("admin update-record failed", { moduleId, id, userId: user.id, error: error?.message });
    return relativeRedirect(editRecordPath(moduleId, id, "No se pudo actualizar el registro. Revisa los datos e inténtalo de nuevo."));
  }

  const { error: logError } = await supabase.from("admin_logs").insert({
    admin_user_id: user.id,
    action: "Editó registro",
    module: moduleId,
    details: { record_id: id },
  });
  if (logError) console.error("admin update-record log failed", { moduleId, id, userId: user.id, error: logError.message });

  return relativeRedirect(`${rolePanelPaths[role]}?result=updated&module=${encodeURIComponent(moduleId)}#${moduleId}`);
}
