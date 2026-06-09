import type { Metadata } from "next";
import { Anchor, Compass, Lock, LogIn, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en TOP ROLEPLAY para continuar tu historia, reputación y progreso.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default async function PlayerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/cuenta");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss px-4 py-10 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="city-grid pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div aria-hidden="true" className="smoke-texture pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
        <section className="hidden lg:block">
          <Link className="mb-10 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.26em] text-gold-300" href="/">
            <Image alt="" height={42} src="/TOP_ROLEPLAY_traced_real.svg" width={42} />
            TOP ROLEPLAY
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-magic">Acceso TOP ROLEPLAY</p>
          <h1 className="mt-4 font-fantasy text-6xl font-black leading-none text-white">Vuelve a la ciudad.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
            Inicia sesión para continuar tu historia, reputación y progreso dentro de la ciudad de TOP ROLEPLAY.
          </p>
          <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
            {["Cuenta protegida", "Acceso a descargas", "Perfil de jugador", "Comunidad activa"].map((item) => (
              <div className="rounded-2xl border border-gold-300/15 bg-black/45 p-4 text-sm font-bold text-neutral-200 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/30 hover:bg-black/55" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <Card className="relative w-full p-6 sm:p-8">
          <div className="absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.14),transparent_18rem)]" />
          <div className="relative">
            <div className="text-center">
              <Image alt="TOP ROLEPLAY" className="mx-auto drop-shadow-[0_0_26px_rgba(255,215,0,0.28)]" height={104} priority src="/TOP_ROLEPLAY_traced_real.svg" width={104} />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Acceso TOP ROLEPLAY</p>
              <h2 className="mt-3 font-fantasy text-3xl font-black">Iniciar sesión</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">Usa tu correo o nombre de jugador para volver a la ciudad.</p>
            </div>

            {error ? (
              <p className="mt-6 rounded-xl border border-crimson/50 bg-crimson/12 p-3 text-sm text-red-100" role="alert">
                {error === "missing"
                  ? "Completa tu correo o usuario y contraseña."
                  : error === "invalid_origin"
                    ? "La solicitud no coincide con el origen de la web. Recarga la página e inténtalo de nuevo."
                    : "Credenciales inválidas o correo sin confirmar."}
              </p>
            ) : null}

            <form action="/api/auth/login" className="mt-7 grid gap-4" method="post">
              <label className="grid gap-2 text-sm font-bold text-neutral-300">
                Correo o nombre de usuario
                <span className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 transition focus-within:border-cyan-magic/70 focus-within:ring-2 focus-within:ring-cyan-magic/15">
                  <UserRound aria-hidden="true" className="text-cyan-magic" size={18} />
                  <input
                    autoComplete="username"
                    className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600"
                    name="identifier"
                    placeholder="OficialAurelio o jugador@ejemplo.com"
                    required
                    type="text"
                  />
                </span>
              </label>
              <label className="grid gap-2 text-sm font-bold text-neutral-300">
                Contraseña
                <span className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 transition focus-within:border-cyan-magic/70 focus-within:ring-2 focus-within:ring-cyan-magic/15">
                  <Lock aria-hidden="true" className="text-cyan-magic" size={18} />
                  <input
                    autoComplete="current-password"
                    className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600"
                    name="password"
                    placeholder="Tu contraseña"
                    required
                    type="password"
                  />
                </span>
              </label>
              <Button className="mt-2 w-full" type="submit">
                <LogIn aria-hidden="true" className="mr-2" size={18} />
                Iniciar sesión
              </Button>
            </form>

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <Link className="rounded-xl border border-gold-300/15 bg-black/35 px-4 py-3 text-center font-bold text-neutral-300 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/35 hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-magic" href="/">
                Volver a la web
              </Link>
              <Link className="rounded-xl border border-cyan-magic/25 bg-cyan-magic/10 px-4 py-3 text-center font-bold text-cyan-magic transition duration-300 hover:-translate-y-0.5 hover:border-cyan-magic/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-magic" href="/registro">
                Crear cuenta
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-300/15 bg-black/35 p-4 text-sm leading-6 text-neutral-400">
              <Compass aria-hidden="true" className="mt-1 shrink-0 text-gold-300" size={18} />
              <p>Si tu correo requiere confirmación, revisa la bandeja antes de intentar entrar.</p>
            </div>
          </div>
        </Card>
      </div>

      <Link className="absolute left-4 top-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-500 hover:text-gold-300 lg:hidden" href="/">
        <Anchor aria-hidden="true" size={16} />
        TOP ROLEPLAY
      </Link>
    </main>
  );
}
