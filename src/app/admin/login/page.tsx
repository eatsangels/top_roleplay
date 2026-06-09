import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-abyss px-4 py-16 text-white">
      <div className="absolute inset-0 city-grid opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(176,0,32,0.34),transparent_30rem),radial-gradient(circle_at_80%_20%,rgba(0,229,255,0.18),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.86))]" />

      <Card className="relative w-full max-w-md p-7 shadow-[0_0_80px_rgba(176,0,32,0.22)]">
        <div className="text-center">
          <Image alt="TOP ROLEPLAY" className="mx-auto drop-shadow-[0_0_28px_rgba(212,175,55,0.38)]" height={92} priority src="/TOP_ROLEPLAY_traced_real.svg" width={92} />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Panel Administrativo TOP ROLEPLAY</p>
          <h1 className="mt-3 font-fantasy text-3xl font-black text-white">Acceso del Staff</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">Acceso exclusivo para el staff autorizado del servidor.</p>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-crimson/40 bg-crimson/10 px-4 py-3 text-sm font-bold text-red-200">
            {error === "missing"
              ? "Completa email y contraseña."
              : error === "unauthorized"
                ? "Tu cuenta no tiene un rol administrativo autorizado."
                : error === "invalid_origin"
                  ? "La solicitud no coincide con el origen del panel. Recarga la página e inténtalo de nuevo."
                : "Credenciales inválidas."}
          </div>
        ) : null}

        <form action="/api/auth/admin-login" className="mt-8 grid gap-4" method="post">
          <label className="grid gap-2 text-sm font-bold text-neutral-300">
            Email
            <span className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/45 px-4 py-3 focus-within:border-cyan-magic/60">
              <Mail className="text-cyan-magic" size={18} />
              <input className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600" name="email" placeholder="admin@toproleplay.com" required type="email" />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-bold text-neutral-300">
            Contraseña
            <span className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/45 px-4 py-3 focus-within:border-cyan-magic/60">
              <Lock className="text-cyan-magic" size={18} />
              <input className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600" name="password" placeholder="Contraseña" required type="password" />
            </span>
          </label>
          <Button className="mt-2 w-full" type="submit"><ShieldCheck className="mr-2" size={18} />Entrar al Panel</Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-neutral-500">
          <Link className="hover:text-gold-300" href="/">Volver a la web</Link>
          <span>Supabase Auth preparado</span>
        </div>
      </Card>
    </main>
  );
}
