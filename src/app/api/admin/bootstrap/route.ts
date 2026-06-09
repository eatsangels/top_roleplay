import { NextResponse } from "next/server";

import { hasValidRequestOrigin } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BootstrapBody = {
  email?: string;
  password?: string;
  username?: string;
  secret?: string;
};

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as BootstrapBody;
  const expectedSecret = process.env.SUPABASE_BOOTSTRAP_SECRET;
  const admin = createSupabaseAdminClient();
  const { count: existingAdminCount } = await admin.from("admin_roles").select("*", { count: "exact", head: true });

  if ((existingAdminCount ?? 0) > 0) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: role } = user
      ? await supabase.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle()
      : { data: null };

    if (role?.role !== "super_admin") {
      return NextResponse.json({ error: "Only an authenticated super_admin can create more staff." }, { status: 403 });
    }
  } else if (!expectedSecret || body.secret !== expectedSecret) {
    return NextResponse.json({ error: "Invalid bootstrap secret" }, { status: 401 });
  }

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const { data: userData, error: userError } = await admin.auth.admin.createUser({
    email: body.email,
    password: body.password,
    email_confirm: true,
    user_metadata: { username: body.username ?? "TOP Admin" },
  });

  if (userError && !userError.message.toLowerCase().includes("already")) {
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  const userId = userData.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "User already exists or could not be created. Create the Auth user manually, then insert profile/admin role." }, { status: 409 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: body.email,
    username: body.username ?? "TOP Admin",
  });

  if (profileError) {
    return NextResponse.json({ error: profileError.message, hint: "Apply supabase/top-roleplay-schema.sql before bootstrapping." }, { status: 500 });
  }

  const { error: roleError } = await admin.from("admin_roles").upsert({
    user_id: userId,
    role: "super_admin",
  });

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId, role: "super_admin" });
}
