import { rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const assignableRoles: AdminRole[] = ["super_admin", "admin", "moderator", "editor", "support"];

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect(`${rolePanelPaths.super_admin}?error=invalid-origin#staff`);

  const formData = await request.formData();
  const identifier = String(formData.get("identifier") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim() as AdminRole;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !identifier || !assignableRoles.includes(role)) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#staff`);
  }

  const { data: currentRole } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  if (currentRole?.role !== "super_admin") {
    return relativeRedirect("/admin");
  }

  const normalizedEmail = identifier.toLowerCase();
  const profileQuery = identifier.includes("@")
    ? supabase.from("profiles").select("id,email,username").ilike("email", normalizedEmail).maybeSingle()
    : supabase.from("profiles").select("id,email,username").ilike("username", identifier).maybeSingle();
  const { data: profile } = await profileQuery;

  if (!profile) {
    return relativeRedirect(`${rolePanelPaths.super_admin}#staff`);
  }

  if (profile.id === user.id && role !== "super_admin") {
    return relativeRedirect(`${rolePanelPaths.super_admin}#roles-staff`);
  }

  const { error } = await supabase.from("admin_roles").upsert(
    {
      user_id: profile.id,
      role,
    },
    { onConflict: "user_id" },
  );

  if (!error) {
    await supabase.from("admin_logs").insert({
      admin_user_id: user.id,
      action: "Asignó rol de staff",
      module: "staff",
      details: {
        target_user_id: profile.id,
        target_email: profile.email,
        target_username: profile.username,
        role,
      },
    });
  }

  return relativeRedirect(`${rolePanelPaths.super_admin}#roles-staff`);
}
