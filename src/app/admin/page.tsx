import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { rolePanelPaths } from "@/lib/admin-data";

export default async function AdminPage() {
  const { role } = await requireAdmin();
  redirect(rolePanelPaths[role]);
}
