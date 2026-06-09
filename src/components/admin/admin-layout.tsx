import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Moon, ShipWheel } from "lucide-react";

import { adminNav, canAccessModule, rolePanelContent, rolePanelPaths, type AdminRole } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export function AdminLayout({ children, userEmail, userName, userRole }: { children: React.ReactNode; userEmail?: string; userName?: string; userRole?: AdminRole }) {
  const displayName = userName ?? userEmail ?? "Staff";
  const displayRole = userRole ?? "support";
  const panel = rolePanelContent[displayRole];
  const nav = adminNav
    .filter((item) => canAccessModule(displayRole, item.id))
    .map((item) => item.id === "dashboard"
      ? { ...item, href: rolePanelPaths[displayRole] }
      : { ...item, href: `${rolePanelPaths[displayRole]}#${item.id}` });

  return (
    <div className="min-h-screen bg-abyss text-white">
      <div className="fixed inset-0 city-grid opacity-80" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(176,0,32,0.28),transparent_28rem),radial-gradient(circle_at_88%_0%,rgba(0,229,255,0.16),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.82))]" />
      <div className="fixed left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full border border-gold-300/10 opacity-25 shadow-[0_0_90px_rgba(212,175,55,0.18)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[19rem_1fr]">
        <aside className="city-panel border-b border-gold-300/15 bg-black/85 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-gold-300/15 p-5">
            <div className="rounded-2xl border border-gold-300/20 bg-gold-300/10 p-2 shadow-[0_0_32px_rgba(212,175,55,0.18)]">
              <Image alt="TOP ROLEPLAY" height={46} src="/TOP_ROLEPLAY_traced_real.svg" width={46} />
            </div>
            <div>
              <p className="font-fantasy text-lg font-black text-gold-300">TOP ROLEPLAY</p>
              <p className="text-xs uppercase tracking-[0.24em] text-neutral-500">Panel administrativo</p>
            </div>
          </div>
          <div className="gold-divider" />
          <nav className="grid max-h-[calc(100vh-88px)] gap-1 overflow-y-auto p-3">
            <p className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.28em] text-neutral-600">Rutas del staff</p>
            {nav.map((item, index) => (
              <Link
                className={cn(
                  "group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-bold text-neutral-300 transition hover:border-gold-300/25 hover:bg-gold-300/10 hover:text-gold-300",
                  index === 0 && "border-gold-300/30 bg-gold-300/10 text-gold-300 shadow-[0_0_24px_rgba(212,175,55,0.08)]",
                )}
                href={item.href}
                key={item.label}
              >
                <span className="rounded-lg border border-white/10 bg-black/35 p-1.5 text-cyan-magic transition group-hover:text-gold-300">
                  <item.icon size={16} />
                </span>
                {item.label}
              </Link>
            ))}
            <form action="/api/auth/admin-logout" method="post">
              <button className="mt-2 flex w-full items-center gap-3 rounded-xl border border-crimson/35 px-3 py-2.5 text-sm font-bold text-red-300 hover:bg-crimson/10" type="submit">
                <LogOut size={18} /> Cerrar sesión
              </button>
            </form>
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-40 border-b border-gold-300/15 bg-black/72 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-magic">{panel.eyebrow} · TOP ROLEPLAY</p>
                <h1 className="mt-1 font-fantasy text-2xl font-black text-white md:text-3xl">{panel.title}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link className="rounded-xl border border-gold-300/25 px-4 py-2 text-sm font-bold text-gold-300 hover:bg-gold-300/10" href="/">Volver a la web</Link>
                <button className="rounded-xl border border-white/10 p-2 text-neutral-300 hover:text-cyan-magic" aria-label="Notificaciones"><Bell size={19} /></button>
                <button className="rounded-xl border border-white/10 p-2 text-neutral-300 hover:text-gold-300" aria-label="Cambiar tema"><Moon size={19} /></button>
                <div className="flex items-center gap-3 rounded-xl border border-gold-300/20 bg-black/45 px-3 py-2 shadow-[0_0_22px_rgba(0,229,255,0.06)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-crimson text-black"><ShipWheel size={18} /></div>
                  <div>
                    <p className="text-sm font-black">{displayName}</p>
                    <p className="text-xs text-cyan-magic">{displayRole}</p>
                    {userEmail ? <p className="text-[10px] text-neutral-500">{userEmail}</p> : null}
                  </div>
                </div>
              </div>
            </div>
          </header>
          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
