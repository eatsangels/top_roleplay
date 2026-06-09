import { moduleWriteRoles, rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { adminRecordForms, applyAdminManagedFields, parseAdminRecordForm } from "@/lib/admin-forms";
import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function newRecordPath(moduleId: string, error: string) {
  return `/admin/nuevo/${moduleId}?error=${encodeURIComponent(error)}`;
}

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin?error=invalid-origin");

  const formData = await request.formData();
  const moduleId = String(formData.get("module") ?? "");
  const form = adminRecordForms[moduleId];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !form) return relativeRedirect("/admin");

  const { data: roleRecord } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = roleRecord?.role as AdminRole | undefined;
  if (!role || !moduleWriteRoles[moduleId]?.includes(role)) return relativeRedirect("/admin?error=unauthorized");

  const parsed = parseAdminRecordForm(moduleId, formData);
  if (!parsed.record) return relativeRedirect(newRecordPath(moduleId, parsed.error ?? "Datos no válidos."));

  const record = applyAdminManagedFields(moduleId, parsed.record, user.id, "create");
  const { data, error } = await supabase.from(form.table).insert(record).select("id").maybeSingle();
  if (error || !data) {
    console.error("admin create-record failed", { moduleId, userId: user.id, error: error?.message });
    return relativeRedirect(newRecordPath(moduleId, "No se pudo crear el registro. Revisa los datos e inténtalo de nuevo."));
  }

  const { error: logError } = await supabase.from("admin_logs").insert({
    admin_user_id: user.id,
    action: "Creó registro",
    module: moduleId,
    details: { record_id: data.id, title: record.title ?? record.name ?? null },
  });
  if (logError) console.error("admin create-record log failed", { moduleId, userId: user.id, error: logError.message });

  return relativeRedirect(`${rolePanelPaths[role]}?result=created&module=${encodeURIComponent(moduleId)}#${moduleId}`);
}
