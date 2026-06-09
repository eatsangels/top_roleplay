import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { rolePanelPaths } from "@/lib/admin-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const publicSettingKeys = new Set(["public_config", "public_metrics", "public_content"]);

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect(`${rolePanelPaths.super_admin}?error=invalid-origin#configuracion`);

  const formData = await request.formData();
  const key = String(formData.get("key") ?? "").trim();
  const rawValue = String(formData.get("value") ?? "").trim();
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !publicSettingKeys.has(key) || !rawValue) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
  }

  const { data: role } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (role?.role !== "super_admin") {
    return relativeRedirect("/admin");
  }

  let value: unknown;
  try {
    value = JSON.parse(rawValue);
  } catch {
    return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
  }

  if (key === "public_config" && (value === null || typeof value !== "object" || Array.isArray(value))) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
  }
  if (key === "public_metrics" && !Array.isArray(value)) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
  }
  if (key === "public_content" && (value === null || typeof value !== "object" || Array.isArray(value))) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
  }

  const { error } = await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
  if (!error) {
    await supabase.from("admin_logs").insert({
      admin_user_id: user.id,
      action: "Actualizó configuración",
      module: "configuracion",
      details: { key },
    });
  }

  return relativeRedirect(`${rolePanelPaths.super_admin}#configuracion`);
}
