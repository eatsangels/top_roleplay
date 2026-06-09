import type { Metadata } from "next";
import { Anchor, Download, Flag, Inbox, LifeBuoy, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPublicContent } from "@/lib/public-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mi cuenta",
  description: "Panel privado de jugador de TOP ROLEPLAY.",
  robots: { index: false, follow: false },
};

const supportMessages: Record<string, string> = {
  ticket_created: "Ticket enviado. El equipo de soporte lo verá en el panel.",
  report_created: "Reporte enviado. Moderación lo revisará desde el panel de staff.",
};

const supportErrors: Record<string, string> = {
  invalid_origin: "La solicitud no coincide con el origen de la web. Recarga la página e inténtalo de nuevo.",
  player_missing: "Tu perfil de jugador no está completo. Contacta al staff.",
  invalid_ticket: "Completa categoría, asunto y mensaje del ticket con más detalle.",
  invalid_report: "Indica el jugador reportado y un motivo de al menos 20 caracteres.",
  attachment_size: "El archivo no puede superar 10MB.",
  attachment_type: "Ese tipo de archivo no está permitido. Usa imagen, PDF, TXT o video MP4/MOV.",
  attachment_bucket: "No se pudo preparar el almacenamiento de Supabase para adjuntos.",
  attachment_failed: "No se pudo subir el archivo adjunto. Inténtalo de nuevo.",
  reported_player: "No encontramos ese jugador o no puedes reportarte a ti mismo.",
  ticket_failed: "No se pudo crear el ticket. Inténtalo de nuevo.",
  report_failed: "No se pudo crear el reporte. Inténtalo de nuevo.",
  invalid_type: "Tipo de solicitud no válido.",
};

type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
};

type SupportReport = {
  id: string;
  reported_player_id: string | null;
  reason: string;
  status: string;
  priority: string;
  created_at: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat("es-ES", { dateStyle: "short", timeStyle: "short", timeZone: "UTC" });

function formatSupportDate(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function statusLabel(value: string) {
  return value === "en_revision" ? "En revisión" : value;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ support?: string; support_error?: string }>;
}) {
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = createSupabaseAdminClient();
  const [{ data: profile }, publicContent, { data: player }] = await Promise.all([
    supabase.from("profiles").select("username, email").eq("id", user.id).maybeSingle(),
    getPublicContent(),
    admin.from("players").select("id,username").eq("profile_id", user.id).maybeSingle(),
  ]);
  const username = profile?.username ?? user.user_metadata?.username ?? "Jugador";
  const email = profile?.email ?? user.email ?? "Correo no disponible";
  const [{ data: tickets }, { data: reports }] = player
    ? await Promise.all([
        admin.from("tickets").select("id,category,subject,status,priority,created_at").eq("player_id", player.id).order("created_at", { ascending: false }).limit(5),
        admin.from("reports").select("id,reported_player_id,reason,status,priority,created_at").eq("reporter_player_id", player.id).order("created_at", { ascending: false }).limit(5),
      ])
    : [{ data: [] }, { data: [] }];
  const reportedPlayerIds = Array.from(new Set((reports ?? []).map((report: SupportReport) => report.reported_player_id).filter(Boolean))) as string[];
  const { data: reportedPlayers } = reportedPlayerIds.length
    ? await admin.from("players").select("id,username").in("id", reportedPlayerIds)
    : { data: [] };
  const reportedPlayerMap = new Map((reportedPlayers ?? []).map((item) => [item.id, item.username]));

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-abyss px-4 py-10 text-white sm:px-6 lg:px-8">
      <div aria-hidden="true" className="city-grid pointer-events-none fixed inset-0 z-0 opacity-70" />
      <div aria-hidden="true" className="smoke-texture pointer-events-none fixed inset-0 z-0 opacity-60" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <Card className="relative w-full overflow-hidden p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,229,255,0.14),transparent_24rem),radial-gradient(circle_at_10%_90%,rgba(176,0,32,0.22),transparent_24rem)]" />
          <div className="relative">
            <header className="flex flex-col gap-6 border-b border-gold-300/15 pb-8 sm:flex-row sm:items-center sm:justify-between">
              <Link className="inline-flex items-center gap-3" href="/">
                <Image alt="TOP ROLEPLAY" className="drop-shadow-[0_0_24px_rgba(255,215,0,0.28)]" height={64} priority src="/TOP_ROLEPLAY_traced_real.svg" width={64} />
                <span>
                  <span className="block font-fantasy text-xl font-black text-gold-300">TOP ROLEPLAY</span>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-[0.24em] text-neutral-500">Identidad TOP ROLEPLAY</span>
                </span>
              </Link>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-magic/30 bg-cyan-magic/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-cyan-magic">
                <ShieldCheck aria-hidden="true" size={16} />
                Sesión activa
              </span>
            </header>

            <div className="grid gap-8 py-8 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="rounded-3xl border border-gold-300/15 bg-black/45 p-6 text-center">
                <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-gold-300/30 bg-gradient-to-br from-gold-300/15 via-black to-crimson/20 text-gold-300 shadow-[0_0_38px_rgba(212,175,55,0.18)]">
                  <UserRound aria-hidden="true" size={36} />
                </span>
                <p className="mt-6 text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Identidad registrada</p>
                <h1 className="mt-3 break-words font-fantasy text-3xl font-black text-white">{username}</h1>
                <p className="mt-3 flex items-center justify-center gap-2 break-all text-sm text-neutral-400">
                  <Mail aria-hidden="true" size={15} />
                  {email}
                </p>
              </section>

              <section>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Tu espacio TOP ROLEPLAY</p>
                <h2 className="mt-3 font-fantasy text-3xl font-black text-white">Tu historia continúa aquí</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-400">
                  La cuenta está conectada. Desde aquí puedes volver a la web, descargar el cliente o cerrar la sesión de forma segura.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Cuenta", "Activa"],
                    ["Facción", "Por elegir"],
                    ["Acceso", publicContent.config.serverStatus],
                  ].map(([label, value]) => (
                    <div className="rounded-2xl border border-gold-300/15 bg-black/45 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gold-300/30 hover:bg-black/55" key={label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
                      <p className="mt-2 font-fantasy text-lg font-black text-gold-300">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <Button href="/">
                    <Anchor aria-hidden="true" className="mr-2" size={18} />
                    Volver a la web
                  </Button>
                  <Button download href={publicContent.config.clientDownloadUrl} variant="secondary">
                    <Download aria-hidden="true" className="mr-2" size={18} />
                    {publicContent.downloadCta.primaryLabel}
                  </Button>
                  <Button download href={publicContent.config.installationGuideUrl} variant="ghost">
                    Guía de instalación
                  </Button>
                  <Button href="#soporte" variant="secondary">
                    <LifeBuoy aria-hidden="true" className="mr-2" size={18} />
                    Centro de soporte
                  </Button>
                  <form action="/api/auth/logout" method="post">
                    <Button className="w-full" type="submit" variant="ghost">
                      <LogOut aria-hidden="true" className="mr-2" size={18} />
                      Cerrar sesión
                    </Button>
                  </form>
                </div>
              </section>
            </div>

            <footer className="flex flex-col gap-3 border-t border-gold-300/15 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
              <p>Tu sesión se valida en el servidor antes de mostrar esta página.</p>
              <Link className="font-bold uppercase tracking-wider hover:text-gold-300" href="/admin/login">
                Acceso del staff
              </Link>
            </footer>
          </div>
        </Card>
      </div>

      <section className="relative z-10 mx-auto mt-10 w-full max-w-5xl" id="soporte">
        <Card className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 border-b border-gold-300/15 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">Centro de soporte</p>
              <h2 className="mt-3 font-fantasy text-3xl font-black text-white">Reporta incidencias al staff</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-400">
                Envía tickets de ayuda o reporta jugadores. El staff los verá en los módulos Reportes y Tickets del panel administrativo.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gold-300/25 bg-gold-300/10 px-4 py-2 text-xs font-black uppercase tracking-wider text-gold-300">
              <LifeBuoy aria-hidden="true" size={16} /> Staff verificará
            </span>
          </div>

          {query.support ? (
            <p className="mt-6 rounded-xl border border-cyan-magic/30 bg-cyan-magic/10 p-3 text-sm text-cyan-magic" role="status">
              {supportMessages[query.support] ?? "Solicitud enviada."}
            </p>
          ) : null}
          {query.support_error ? (
            <p className="mt-6 rounded-xl border border-crimson/50 bg-crimson/12 p-3 text-sm text-red-100" role="alert">
              {supportErrors[query.support_error] ?? "No se pudo enviar la solicitud."}
            </p>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <form action="/api/support/create" className="rounded-3xl border border-cyan-magic/20 bg-black/35 p-5" encType="multipart/form-data" method="post">
              <input name="type" type="hidden" value="ticket" />
              <LifeBuoy aria-hidden="true" className="mb-4 text-cyan-magic" size={30} />
              <h3 className="font-fantasy text-2xl font-black text-white">Abrir ticket</h3>
              <div className="mt-5 grid gap-4">
                <SupportSelect label="Categoría" name="category" options={["soporte", "bug", "cuenta", "juego", "otro"]} />
                <SupportInput label="Asunto" name="subject" placeholder="No puedo entrar al servidor" />
                <SupportSelect label="Prioridad" name="priority" options={["baja", "media", "alta"]} />
                <SupportTextarea label="Mensaje" name="message" placeholder="Explica qué pasó, cuándo ocurrió y qué necesitas." />
                <SupportFile />
                <Button className="w-full" type="submit" variant="secondary">Enviar ticket</Button>
              </div>
            </form>

            <form action="/api/support/create" className="rounded-3xl border border-red-400/20 bg-black/35 p-5" encType="multipart/form-data" method="post">
              <input name="type" type="hidden" value="report" />
              <Flag aria-hidden="true" className="mb-4 text-red-300" size={30} />
              <h3 className="font-fantasy text-2xl font-black text-white">Reportar jugador</h3>
              <div className="mt-5 grid gap-4">
                <SupportInput label="Jugador reportado" name="reported_username" placeholder="Nombre exacto del jugador" />
                <SupportSelect label="Prioridad" name="priority" options={["baja", "media", "alta"]} />
                <SupportTextarea label="Motivo" name="reason" placeholder="Describe la infracción, lugar, hora aproximada y cualquier contexto útil." />
                <SupportFile />
                <Button className="w-full" type="submit">Enviar reporte</Button>
              </div>
            </form>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SupportHistory title="Mis tickets" empty="Aún no tienes tickets." items={(tickets ?? []) as SupportTicket[]} render={(ticket) => (
              <>
                <span>{ticket.category}</span>
                <strong>{ticket.subject}</strong>
                <span>{statusLabel(ticket.status)} · {ticket.priority} · {formatSupportDate(ticket.created_at)}</span>
              </>
            )} />
            <SupportHistory title="Mis reportes" empty="Aún no tienes reportes." items={(reports ?? []) as SupportReport[]} render={(report) => (
              <>
                <span>Contra {reportedPlayerMap.get(report.reported_player_id ?? "") ?? "Jugador"}</span>
                <strong>{report.reason}</strong>
                <span>{statusLabel(report.status)} · {report.priority} · {formatSupportDate(report.created_at)}</span>
              </>
            )} />
          </div>
        </Card>
      </section>
    </main>
  );
}

function SupportInput({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      {label}
      <input className="rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-magic/70 focus:ring-2 focus:ring-cyan-magic/15" maxLength={120} name={name} placeholder={placeholder} required type="text" />
    </label>
  );
}

function SupportTextarea({ label, name, placeholder }: { label: string; name: string; placeholder: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      {label}
      <textarea className="min-h-32 rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-magic/70 focus:ring-2 focus:ring-cyan-magic/15" maxLength={2000} minLength={20} name={name} placeholder={placeholder} required />
    </label>
  );
}

function SupportSelect({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      {label}
      <select className="rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 text-white outline-none transition focus:border-cyan-magic/70 focus:ring-2 focus:ring-cyan-magic/15" defaultValue={options[0]} name={name} required>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function SupportFile() {
  return (
    <label className="grid gap-2 text-sm font-bold text-neutral-300">
      Archivo adjunto opcional
      <input accept="image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,video/mp4,video/quicktime" className="rounded-xl border border-gold-300/20 bg-black/55 px-4 py-3 text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-magic/15 file:px-3 file:py-2 file:text-xs file:font-black file:uppercase file:text-cyan-magic" name="attachment" type="file" />
      <span className="text-xs font-normal leading-5 text-neutral-500">Máximo 10MB. Puedes subir capturas desde móvil/PC, PDF, TXT o video MP4/MOV.</span>
    </label>
  );
}

function SupportHistory<T extends { id: string }>({ empty, items, render, title }: { empty: string; items: T[]; render: (item: T) => React.ReactNode; title: string }) {
  return (
    <section className="rounded-3xl border border-gold-300/15 bg-black/35 p-5">
      <h3 className="font-fantasy text-xl font-black text-white">{title}</h3>
      <div className="mt-4 grid gap-3">
        {items.length ? items.map((item) => (
          <div className="grid gap-1 rounded-2xl border border-white/10 bg-black/40 p-4 text-sm transition duration-300 hover:border-cyan-magic/20 hover:bg-black/55" key={item.id}>
            {render(item)}
          </div>
        )) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-black/25 py-8 text-center">
            <span className="tr-pulse grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-black/50">
              <Inbox aria-hidden="true" className="text-cyan-magic/70" size={18} />
            </span>
            <p className="text-sm text-neutral-500">{empty}</p>
          </div>
        )}
      </div>
    </section>
  );
}
