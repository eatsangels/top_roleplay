import { hasValidRequestOrigin, relativeRedirect } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!hasValidRequestOrigin(request)) return relativeRedirect("/registro?error=invalid_origin");

  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (username.length < 3 || username.length > 24) {
    return relativeRedirect("/registro?error=username");
  }

  if (!email.includes("@")) {
    return relativeRedirect("/registro?error=email");
  }

  if (password.length < 8 || password !== confirmPassword) {
    return relativeRedirect("/registro?error=password");
  }

  const admin = createSupabaseAdminClient();
  const [{ data: usernameOwner }, { data: emailOwner }] = await Promise.all([
    admin.from("profiles").select("id").ilike("username", username).limit(1).maybeSingle(),
    admin.from("profiles").select("id").eq("email", email).limit(1).maybeSingle(),
  ]);

  if (usernameOwner) {
    return relativeRedirect("/registro?error=username_exists");
  }

  if (emailOwner) {
    return relativeRedirect("/registro?error=exists");
  }

  const supabase = await createSupabaseServerClient();
  let { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  let autoConfirmed = false;
  if (error?.code === "over_email_send_rate_limit" && process.env.NODE_ENV !== "production") {
    const fallback = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username },
    });
    data = { user: fallback.data.user, session: null };
    error = fallback.error;
    autoConfirmed = !fallback.error;
  }

  if (error) {
    const reason = signupErrorReason(error.code, error.message);
    return relativeRedirect(`/registro?error=${reason}`);
  }

  if (data.user) {
    const { error: profileError } = await admin.from("profiles").upsert({ id: data.user.id, email, username }, { onConflict: "id" });
    const { data: player } = await admin.from("players").select("id").eq("profile_id", data.user.id).maybeSingle();
    let playerError = null;

    if (player) {
      const result = await admin.from("players").update({ email, username }).eq("id", player.id);
      playerError = result.error;
    } else {
      const result = await admin.from("players").insert({ profile_id: data.user.id, email, username, status: "pendiente" });
      playerError = result.error;
    }

    if (profileError || playerError) {
      await admin.auth.admin.deleteUser(data.user.id);
      const reason = profileError?.message.toLowerCase().includes("username") || playerError?.message.toLowerCase().includes("username")
        ? "username_exists"
        : "profile";
      return relativeRedirect(`/registro?error=${reason}`);
    }
  }

  return relativeRedirect(`/registro?success=1${autoConfirmed ? "&confirmed=1" : ""}`);
}

function signupErrorReason(code?: string, message = "") {
  const normalized = `${code ?? ""} ${message}`.toLowerCase();

  if (normalized.includes("registered") || normalized.includes("already")) return "exists";
  if (normalized.includes("email_address_invalid") || normalized.includes("email address")) return "email_invalid";
  if (normalized.includes("rate") || normalized.includes("limit")) return "rate_limit";
  if (normalized.includes("disabled")) return "disabled";
  if (normalized.includes("password")) return "password";
  return "signup";
}
