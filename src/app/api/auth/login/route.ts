import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/login?error=invalid_origin");

  const formData = await request.formData();
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier || !password) {
    return relativeRedirect("/login?error=missing");
  }

  let email = identifier;

  if (!identifier.includes("@")) {
    const admin = createSupabaseAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("email")
      .ilike("username", identifier)
      .limit(1)
      .maybeSingle();

    if (!profile?.email) {
      return relativeRedirect("/login?error=invalid");
    }

    email = profile.email;
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return relativeRedirect("/login?error=invalid");
  }

  const admin = createSupabaseAdminClient();
  await admin.from("players").update({ last_login_at: new Date().toISOString() }).eq("email", email);

  return relativeRedirect("/cuenta");
}
