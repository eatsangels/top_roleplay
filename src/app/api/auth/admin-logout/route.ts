import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/admin/login");

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return relativeRedirect("/admin/login");
}
