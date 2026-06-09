import type { Metadata } from "next";
import { Anchor, Check, Lock, Mail, ScrollText, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta de TOP ROLEPLAY y entra a la ciudad de policías, bandas y civiles.",
  alternates: { canonical: "/registro" },
  robots: { index: false, follow: true },
};

const errors: Record<string, string> = {
  username: "El nombre debe tener entre 3 y 24 caracteres.",
  email: "Introduce un correo válido.",
  password: "La contraseña debe tener 8 caracteres como mínimo y ambas contraseñas deben coincidir.",
  exists: "Ya existe una cuenta con ese correo.",
  username_exists: "Ese nombre de jugador ya está ocupado.",
  email_invalid: "Supabase rechazó ese correo. Comprueba que sea una dirección real y esté bien escrita.",
  rate_limit: "Se alcanzó temporalmente el límite de registros o correos. Espera unos minutos e inténtalo de nuevo.",
  invalid_origin: "La solicitud no coincide con el origen de la web. Recarga la página e inténtalo de nuevo.",
  disabled: "El registro de nuevas cuentas está desactivado en Supabase.",
  profile: "La cuenta no pudo completar su perfil de jugador. No se guardó una cuenta incompleta.",
  signup: "No fue posible crear la cuenta. Inténtalo de nuevo.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; confirmed?: string }>;
}) {
  const { error, success, confirmed } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss px-4 py-10 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="city-grid pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div aria-hidden="true" className="smoke-texture pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <Link className="mb-10 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.26em] text-gold-300" href="/">
            <Image alt="" height={42} src="/TOP_ROLEPLAY_traced_real.svg" width={42} />
            TOP ROLEPLAY
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-magic">Registro TOP ROLEPLAY</p>
          <h1 className="mt-4 font-fantasy text-6xl font-black leading-none text-white">Elige el nombre que recordará la comunidad.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-neutral-300">
            Crea una identidad de jugador única. Tu nombre será la primera pieza de reputación dentro de TOP ROLEPLAY.
          </p>
          <div className="mt-8 space-y-4">
            {[
              ["01", "Nombre único", "Entre 3 y 24 caracteres."],
              ["02", "Correo válido", "Puede requerir confirmación."],
              ["03", "Clave segura", "Mínimo 8 caracteres."],
            ].map(([number, title, text]) => (
              <div className="flex max-w-xl items-start gap-4 rounded-2xl border border-gold-300/15 bg-black/45 p-4" key={number}>
                <span className="font-fantasy text-xl font-black text-gold-300">{number}</span>
                <div>
                  <p className="font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm text-neutral-400">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Card className="relative w-full p-6 sm:p-8">
          <div className="absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(0,229,255,0.14),transparent_18rem)]" />
          <div className="relative">
            <div className="text-center">
              <Image alt="TOP ROLEPLAY" className="mx-auto drop-shadow-[0_0_26px_rgba(255,215,0,0.28)]" height={96} priority src="/TOP_ROLEPLAY_traced_real.svg" width={96} />
              <p className="mt-5 text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Nueva identidad TOP ROLEPLAY</p>
              <h2 className="mt-3 font-fantasy text-3xl font-black">Crea tu cuenta</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-400">Registra tu identidad antes de entrar a TOP ROLEPLAY.</p>
            </div>

            {success ? (
              <div className="mt-7 rounded-2xl border border-cyan-magic/30 bg-cyan-magic/10 p-6 text-center" role="status">
                <span className="tr-pulse mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-magic/35 bg-black/35 text-cyan-magic">
                  <Check aria-hidden="true" size={28} />
                </span>
                <p className="mt-4 font-fantasy text-2xl font-black text-white">Cuenta creada</p>
                <p className="mt-3 text-sm leading-6 text-neutral-300">
                  {confirmed ? "La cuenta está confirmada y ya puedes iniciar sesión." : "Revisa tu correo para confirmar la cuenta antes de jugar."}
                </p>
                <Button className="mt-6" href="/login" variant="secondary">
                  Iniciar sesión
                </Button>
              </div>
            ) : (
              <form action="/api/auth/register" className="mt-7 grid gap-4" method="post">
                {error ? (
                  <p className="rounded-xl border border-crimson/50 bg-crimson/12 p-3 text-sm text-red-100" role="alert">
                    {errors[error] ?? errors.signup}
                  </p>
                ) : null}
                <Field autoComplete="username" icon={UserRound} label="Nombre de jugador" name="username" placeholder="AurelioCity" type="text" />
                <Field autoComplete="email" icon={Mail} label="Email" name="email" placeholder="jugador@ejemplo.com" type="email" />
                <Field autoComplete="new-password" icon={Lock} label="Contraseña" name="password" placeholder="8 caracteres mínimo" type="password" />
                <Field autoComplete="new-password" icon={ShieldCheck} label="Confirmar contraseña" name="confirmPassword" placeholder="Repite tu contraseña" type="password" />
                <Button className="mt-2 w-full" type="submit">
                  Crear cuenta
                </Button>
              </form>
            )}

            <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <Link className="rounded-xl border border-gold-300/15 bg-black/35 px-4 py-3 text-center font-bold text-neutral-300 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/35 hover:text-gold-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-magic" href="/">
                Volver a la web
              </Link>
              <Link className="rounded-xl border border-cyan-magic/25 bg-cyan-magic/10 px-4 py-3 text-center font-bold text-cyan-magic transition duration-300 hover:-translate-y-0.5 hover:border-cyan-magic/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-magic" href="/login">
                Ya tengo cuenta
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gold-300/15 bg-black/35 p-4 text-sm leading-6 text-neutral-400">
              <ScrollText aria-hidden="true" className="mt-1 shrink-0 text-gold-300" size={18} />
              <p>Al registrarte, reserva un nombre de jugador que se mostrará en tu cuenta y en los sistemas del servidor.</p>
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

function Field({
  autoComplete,
  icon: Icon,
  label,
  name,
  placeholder,
  type,
}: {
  autoComplete: string;
  icon: React.ElementType;
  label: string;
  name: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      {label}
      <span className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 transition focus-within:border-cyan-magic/70 focus-within:ring-2 focus-within:ring-cyan-magic/15">
        <Icon aria-hidden="true" className="text-cyan-magic" size={18} />
        <input
          autoComplete={autoComplete}
          className="w-full bg-transparent text-white outline-none placeholder:text-neutral-600"
          name={name}
          placeholder={placeholder}
          required
          type={type}
        />
      </span>
    </label>
  );
}
