import { moduleWriteRoles, rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { adminRecordForms, isAdminRecordId } from "@/lib/admin-forms";
import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin?error=invalid-origin");

  const formData = await request.formData();
  const moduleId = String(formData.get("module") ?? "");
  const id = String(formData.get("id") ?? "");
  const confirmId = String(formData.get("confirm_id") ?? "");
  const form = adminRecordForms[moduleId];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !form || !isAdminRecordId(id) || confirmId !== id) return relativeRedirect("/admin");

  const { data: roleRecord } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  const role = roleRecord?.role as AdminRole | undefined;
  if (!role || !moduleWriteRoles[moduleId]?.includes(role)) return relativeRedirect("/admin?error=unauthorized");

  const { data, error } = await supabase.from(form.table).delete().eq("id", id).select("id").maybeSingle();
  if (error || !data) {
    console.error("admin delete-record failed", { moduleId, id, userId: user.id, error: error?.message });
    return relativeRedirect(`${rolePanelPaths[role]}?error=delete-failed&module=${encodeURIComponent(moduleId)}#${moduleId}`);
  }

  const { error: logError } = await supabase.from("admin_logs").insert({
    admin_user_id: user.id,
    action: "Eliminó registro",
    module: moduleId,
    details: { record_id: id },
  });
  if (logError) console.error("admin delete-record log failed", { moduleId, id, userId: user.id, error: logError.message });

  return relativeRedirect(`${rolePanelPaths[role]}?result=deleted&module=${encodeURIComponent(moduleId)}#${moduleId}`);
}
