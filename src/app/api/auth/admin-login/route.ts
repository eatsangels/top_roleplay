import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin/login?error=invalid_origin");

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return relativeRedirect("/admin/login?error=missing");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return relativeRedirect("/admin/login?error=invalid");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: role } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user?.id ?? "")
    .maybeSingle();

  if (!role || !(role.role in rolePanelPaths)) {
    await supabase.auth.signOut();
    return relativeRedirect("/admin/login?error=unauthorized");
  }

  return relativeRedirect(rolePanelPaths[role.role as AdminRole]);
}
