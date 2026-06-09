import TopRoleplaySite from "@/components/top-roleplay-site";
import { getPublicContent } from "@/lib/public-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let username = user?.user_metadata?.username as string | undefined;

    if (user) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      username = profile?.username ?? username ?? user.email?.split("@")[0];
    }

    return user ? { username: username ?? "Jugador" } : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const [currentUser, content] = await Promise.all([getCurrentUser(), getPublicContent()]);

  return <TopRoleplaySite content={content} currentUser={currentUser} />;
}
