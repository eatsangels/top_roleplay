import { redirect } from "next/navigation";

import type { AdminRole } from "@/lib/admin-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const adminRoles: AdminRole[] = ["super_admin", "admin", "moderator", "editor", "support"];

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: roleRecord, error } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !roleRecord || !adminRoles.includes(roleRecord.role as AdminRole)) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=unauthorized");
  }

  return {
    supabase,
    user,
    role: roleRecord.role as AdminRole,
  };
}
