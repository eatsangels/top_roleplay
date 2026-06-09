"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import {
  Anchor,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronDown,
  Compass,
  Crosshair,
  Crown,
  Download,
  Gamepad2,
  Gem,
  LogIn,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  Radio,
  ScrollText,
  Shield,
  Skull,
  Sparkles,
  Swords,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PublicConfig, PublicContent, PublicGalleryItem, PublicMetricIcon, PublicVisualIcon } from "@/lib/public-content";
import { cn } from "@/lib/utils";

type CurrentUser = { username: string } | null;

const metricIcons: Record<PublicMetricIcon, React.ElementType> = {
  users: Users,
  online: Zap,
  guilds: Shield,
  events: CalendarDays,
  history: ScrollText,
};

const visualIcons: Record<PublicVisualIcon, React.ElementType> = {
  anchor: Anchor,
  book: BookOpen,
  calendar: CalendarDays,
  compass: Compass,
  crown: Crown,
  download: Download,
  gamepad: Gamepad2,
  gem: Gem,
  map: Map,
  message: MessageCircle,
  scroll: ScrollText,
  shield: Shield,
  skull: Skull,
  sparkles: Sparkles,
  swords: Swords,
  trophy: Trophy,
  users: Users,
  zap: Zap,
};

const pathIcons = [Shield, Skull, Swords, Users, MessageCircle, Map];
const eventIcons = [MapPin, Crosshair, Radio, Shield];

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 28 }}
      transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.18 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

function ImmersiveBackdrop() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const slowY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const reverseY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 24]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -left-40 top-[18vh] h-[32rem] w-[32rem] rounded-full border border-gold-300/8 bg-gold-300/3 blur-[1px]"
        style={reduceMotion ? undefined : { rotate, y: slowY }}
      />
      <motion.div
        className="absolute -right-52 top-[42vh] h-[38rem] w-[38rem] rounded-full bg-cyan-magic/5 blur-[110px]"
        style={reduceMotion ? undefined : { y: reverseY }}
      />
      <motion.div
        className="absolute left-1/3 top-[72vh] h-72 w-72 rounded-full bg-crimson/8 blur-[100px]"
        style={reduceMotion ? undefined : { y: slowY }}
      />
    </div>
  );
}

function ParallaxBand({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: React.ElementType }) {
  const target = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const farY = useTransform(scrollYProgress, [0, 1], ["-16%", "16%"]);
  const nearY = useTransform(scrollYProgress, [0, 1], ["24%", "-24%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);

  return (
    <section ref={target} className="relative h-56 overflow-hidden border-y border-gold-300/10 bg-black/70">
      <motion.div
        aria-hidden="true"
        className="absolute -inset-x-16 -inset-y-20 bg-[radial-gradient(circle_at_50%_50%,rgba(176,0,32,0.34),transparent_34rem),linear-gradient(115deg,rgba(0,229,255,0.08),transparent_38%,rgba(255,215,0,0.08))]"
        style={reduceMotion ? undefined : { y: farY }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute left-[8%] top-1/2 h-48 w-48 -translate-y-1/2 rounded-full border border-gold-300/10"
        style={reduceMotion ? undefined : { rotate, y: nearY }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute right-[9%] top-1/2 text-cyan-magic/10"
        style={reduceMotion ? undefined : { y: nearY }}
      >
        <Icon aria-hidden="true" size={180} strokeWidth={0.8} />
      </motion.div>
      <motion.p
        aria-hidden="true"
        className="absolute -bottom-16 left-[4%] font-fantasy text-[13rem] font-black leading-none tracking-[-0.08em] text-white/[0.025] md:text-[18rem]"
        style={reduceMotion ? undefined : { x: nearY }}
      >
        TOP
      </motion.p>
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.34em] text-cyan-magic">{eyebrow}</p>
          <p className="mt-3 max-w-3xl font-fantasy text-3xl font-black text-white md:text-5xl">{title}</p>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-3xl text-center">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-cyan-magic">{eyebrow}</p>
      <h2 className="font-fantasy text-3xl font-black text-white drop-shadow-[0_0_22px_rgba(212,175,55,0.2)] md:text-5xl">
        {title}
      </h2>
      <div className="mx-auto my-5 h-px w-36 bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
      <p className="text-sm leading-7 text-neutral-300 md:text-base">{text}</p>
    </Reveal>
  );
}

function Header({ currentUser, discordUrl, navItems }: { currentUser: CurrentUser; discordUrl: string; navItems: PublicContent["navItems"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition duration-300",
        scrolled ? "border-b border-gold-300/15 bg-black/88 shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl" : "bg-black/35 backdrop-blur-md",
      )}
    >
      <nav aria-label="Principal" className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a aria-label="TOP ROLEPLAY inicio" className="flex items-center gap-3" href="#inicio">
          <span className="relative h-12 w-12 overflow-hidden rounded-full border border-gold-300/35 bg-black shadow-[0_0_24px_rgba(212,175,55,0.28)]">
            <Image alt="" className="object-contain p-1" fill sizes="48px" src="/TOP_ROLEPLAY_traced_real.svg" />
          </span>
          <span className="font-fantasy text-lg font-black tracking-widest text-gold-300">TOP ROLEPLAY</span>
        </a>

        <div className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <a className="rounded text-xs font-bold uppercase tracking-wider text-neutral-300 transition duration-300 hover:text-gold-300 hover:drop-shadow-[0_0_10px_rgba(255,215,0,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-magic" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {currentUser ? (
            <Button className="min-h-10 px-4 py-2 text-xs" href="/cuenta" variant="ghost">
              <UserBadge username={currentUser.username} />
            </Button>
          ) : (
            <Button className="min-h-10 px-4 py-2 text-xs" href="/login" variant="ghost">
              <LogIn aria-hidden="true" className="mr-2" size={15} />
              Iniciar Sesión
            </Button>
          )}
          <Button className="min-h-10 px-4 py-2 text-xs" href="#descargas">
            Jugar Ahora
          </Button>
        </div>

        <button
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="rounded-xl border border-gold-300/25 p-2 text-gold-300 transition hover:bg-gold-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-magic lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-gold-300/15 bg-black/95 px-4 py-5 lg:hidden" id="mobile-menu">
          <div className="mx-auto grid max-w-7xl gap-3">
            {navItems.map((item) => (
              <a
                className="rounded-xl px-3 py-3 text-sm font-bold uppercase tracking-wider text-neutral-200 hover:bg-gold-300/10"
                href={item.href}
                key={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button href="#descargas">Jugar Ahora</Button>
            {currentUser ? (
              <Button href="/cuenta" variant="ghost">
                <UserBadge username={currentUser.username} />
              </Button>
            ) : (
              <Button href="/login" variant="ghost">
                <LogIn aria-hidden="true" className="mr-2" size={18} />
                Iniciar Sesión
              </Button>
            )}
            <Button href={discordUrl} rel="noreferrer" target="_blank" variant="secondary">
              Discord
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function UserBadge({ username }: { username: string }) {
  return (
    <>
      <Users aria-hidden="true" className="mr-2" size={15} />
      {username}
    </>
  );
}

function Hero({ config }: { config: PublicConfig }) {
  const reduceMotion = useReducedMotion();
  const target = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end start"] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.18]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const emblemY = useTransform(scrollYProgress, [0, 1], ["0%", "38%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0]);

  return (
    <section ref={target} className="relative flex min-h-screen items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8" id="inicio">
      <motion.div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-16"
        style={reduceMotion ? undefined : { scale: backgroundScale, y: backgroundY }}
      >
        <Image alt="" className="object-cover opacity-50" fill priority sizes="100vw" src="/visuals/hero-city.svg" />
        {reduceMotion ? null : (
          <video
            autoPlay
            className="hidden h-full w-full object-cover opacity-45 md:block"
            loop
            muted
            playsInline
            poster="/visuals/trailer-poster.svg"
            preload="none"
          >
            <source media="(min-width: 768px)" src="/Logo_reveal_animation_TOP_ROLEPLAY_202606061133.mp4" type="video/mp4" />
            Tu navegador no puede reproducir el video de fondo.
          </video>
        )}
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),radial-gradient(circle_at_76%_42%,rgba(0,229,255,0.15),transparent_25rem),radial-gradient(circle_at_22%_20%,rgba(176,0,32,0.3),transparent_30rem)] [background-size:5rem_5rem,5rem_5rem,auto,auto]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/76 to-black/35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-abyss to-transparent" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 30 }}
          style={reduceMotion ? undefined : { opacity: heroOpacity, translateY: contentY }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-magic/35 bg-cyan-magic/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-magic shadow-[0_0_34px_rgba(0,229,255,0.14)]">
            <Sparkles aria-hidden="true" size={16} />
            {config.heroEyebrow}
          </div>
          <h1 className="font-fantasy text-5xl font-black leading-none text-white drop-shadow-[0_0_34px_rgba(176,0,32,0.72)] sm:text-7xl lg:text-8xl">
            <span className="block bg-gradient-to-b from-white via-gold-300 to-gold-500 bg-clip-text text-transparent">TOP</span>
            <span className="block bg-gradient-to-b from-gold-300 via-gold-500 to-crimson bg-clip-text text-transparent">ROLEPLAY</span>
          </h1>
          <p className="mt-6 max-w-2xl text-xl font-bold leading-8 text-smoke md:text-2xl">
            {config.heroTagline}
          </p>
          <p className="mt-5 max-w-2xl leading-8 text-neutral-300">
            {config.heroDescription}
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Button download href={config.clientDownloadUrl}>
              <Download aria-hidden="true" className="mr-2" size={18} />
              Descargar Cliente
            </Button>
            <Button href="#descargas" variant="secondary">
              <Gamepad2 aria-hidden="true" className="mr-2" size={18} />
              Cómo empezar
            </Button>
            <Button href="#trailer" variant="ghost">
              Ver Tráiler
            </Button>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="relative hidden min-h-[34rem] lg:block"
          initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.92 }}
          style={reduceMotion ? undefined : { opacity: heroOpacity, translateY: emblemY }}
          transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.12 }}
        >
          <div className="absolute inset-10 rounded-full bg-cyan-magic/12 blur-[110px]" />
          <div className="absolute inset-x-16 bottom-16 h-28 rounded-full bg-crimson/20 blur-[70px]" />

          <div className="absolute right-2 top-8 z-20 flex items-center gap-2 rounded-full border border-emerald-300/25 bg-black/65 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.12)] backdrop-blur-xl">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            {config.serverStatus}
          </div>

          <div className="absolute inset-x-0 top-20 mx-auto max-w-[32rem] overflow-hidden rounded-[2rem] border border-gold-300/20 bg-black/60 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.7)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-magic">Centro de operaciones</p>
                <p className="mt-1 font-fantasy text-xl font-black text-white">Control territorial</p>
              </div>
              <Radio aria-hidden="true" className="text-emerald-300" size={24} />
            </div>

            <div className="relative mt-4 h-72 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(rgba(0,229,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.08)_1px,transparent_1px),radial-gradient(circle_at_center,rgba(0,229,255,0.13),transparent_15rem)] [background-size:2.5rem_2.5rem,2.5rem_2.5rem,auto]">
              <div className="absolute left-[14%] top-[18%] h-24 w-32 rotate-[-8deg] rounded-[45%] border border-cyan-magic/45 bg-cyan-magic/10 shadow-[0_0_28px_rgba(0,229,255,0.14)]" />
              <div className="absolute right-[12%] top-[16%] h-28 w-36 rotate-[9deg] rounded-[42%] border border-red-400/45 bg-crimson/15 shadow-[0_0_28px_rgba(176,0,32,0.2)]" />
              <div className="absolute bottom-[12%] left-[28%] h-24 w-48 rotate-[3deg] rounded-[48%] border border-gold-300/40 bg-gold-300/8 shadow-[0_0_28px_rgba(255,215,0,0.12)]" />
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/80 shadow-[0_0_40px_rgba(255,255,255,0.12)]">
                <Building2 aria-hidden="true" className="text-white" size={34} />
              </div>
              <MapPin aria-hidden="true" className="absolute left-[23%] top-[29%] text-cyan-magic drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" size={25} />
              <Crosshair aria-hidden="true" className="absolute right-[25%] top-[30%] text-red-300 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" size={27} />
              <Users aria-hidden="true" className="absolute bottom-[21%] left-[44%] text-gold-300 drop-shadow-[0_0_10px_rgba(255,215,0,0.7)]" size={25} />
              <span className="absolute bottom-3 right-3 rounded-full border border-red-400/25 bg-black/70 px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-red-300">
                Conflicto activo
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-2 z-20 mx-auto flex w-fit items-center gap-2 rounded-2xl border border-white/10 bg-black/55 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            {[
              { label: "Policía", icon: Shield, tone: "text-cyan-magic" },
              { label: "Bandas", icon: Swords, tone: "text-red-300" },
              { label: "Civiles", icon: Users, tone: "text-gold-300" },
            ].map(({ icon: Icon, label, tone }) => (
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-neutral-200 transition hover:bg-white/5" key={label}>
                <Icon aria-hidden="true" className={tone} size={16} />
                {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function TopRoleplaySite({ currentUser, content }: { currentUser: CurrentUser; content: PublicContent }) {
  const [selectedGallery, setSelectedGallery] = useState<PublicGalleryItem | null>(null);
  const [openFaq, setOpenFaq] = useState(0);
  const closeModalRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedGallery) {
      lastFocusedRef.current?.focus();
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement;
    closeModalRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedGallery(null);

      if (event.key === "Tab") {
        event.preventDefault();
        closeModalRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedGallery]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-abyss text-foreground">
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-black focus:px-4 focus:py-3 focus:text-gold-300" href="#contenido">
        Saltar al contenido
      </a>
      <ImmersiveBackdrop />
      <Header currentUser={currentUser} discordUrl={content.config.discordUrl} navItems={content.navItems} />
      <Hero config={content.config} />

      <div className="relative z-10" id="contenido">
        <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {content.metrics.map((stat) => {
              const Icon = metricIcons[stat.icon];
              return (
                <Reveal key={stat.label}>
                  <Card className="group relative h-full overflow-hidden p-5 text-center transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(255,215,0,0.14)]">
                    <span aria-hidden="true" className="tr-shimmer pointer-events-none absolute inset-0" />
                    <Icon aria-hidden="true" className="relative mx-auto mb-4 text-cyan-magic transition duration-300 group-hover:scale-110 group-hover:text-gold-300" size={28} />
                    <div className="font-fantasy text-3xl font-black text-gold-300">{stat.value}</div>
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-neutral-400">{stat.label}</p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {content.chapters[0] ? <ParallaxBand eyebrow={content.chapters[0].eyebrow} icon={visualIcons[content.chapters[0].icon]} title={content.chapters[0].title} /> : null}

        <section className="smoke-texture relative px-4 py-24 sm:px-6 lg:px-8" id="mundo">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <Reveal>
              <Card className="relative min-h-96 overflow-hidden p-8">
                <div className="absolute inset-0 bg-[url('/visuals/gallery-territories.svg')] bg-cover bg-center opacity-60" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,215,0,0.18),transparent_18rem),linear-gradient(135deg,rgba(58,0,8,0.72),rgba(0,0,0,0.88),rgba(0,229,255,0.12))]" />
                <div className="relative flex h-80 flex-col justify-between rounded-2xl border border-gold-300/20 bg-black/25 p-6 backdrop-blur-[1px]">
                  <Map aria-hidden="true" className="text-gold-300" size={44} />
                  <div>
                    <p className="font-fantasy text-3xl font-black text-white">{content.world.cardTitle}</p>
                    <p className="mt-3 text-sm leading-7 text-neutral-300">{content.world.cardText}</p>
                  </div>
                </div>
              </Card>
            </Reveal>

            <Reveal>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.32em] text-cyan-magic">{content.world.section.eyebrow}</p>
              <h2 className="font-fantasy text-3xl font-black text-white md:text-5xl">{content.world.section.title}</h2>
              <div className="my-6 h-px w-36 bg-gradient-to-r from-gold-300 to-transparent" />
              <p className="leading-8 text-neutral-300">{content.world.section.text}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {content.world.tags.map((item) => (
                  <div className="rounded-2xl border border-gold-300/15 bg-black/45 p-4 text-sm font-black uppercase tracking-wider text-neutral-200" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="sistemas">
          <SectionTitle
            eyebrow={content.systemsSection.eyebrow}
            text={content.systemsSection.text}
            title={content.systemsSection.title}
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {content.systems.map((system) => {
              const Icon = visualIcons[system.icon];
              return (
              <Reveal key={system.title}>
                <Card className="group h-full p-7 transition hover:-translate-y-2 hover:border-cyan-magic/50 hover:shadow-[0_0_42px_rgba(0,229,255,0.14)]">
                  <Icon aria-hidden="true" className="mb-5 text-gold-300 transition group-hover:text-cyan-magic" size={34} />
                  <h3 className="font-fantasy text-xl font-black text-white">{system.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-400">{system.description}</p>
                </Card>
              </Reveal>
              );
            })}
          </div>
        </section>

        {content.chapters[1] ? <ParallaxBand eyebrow={content.chapters[1].eyebrow} icon={visualIcons[content.chapters[1].icon]} title={content.chapters[1].title} /> : null}

        <section className="bg-gradient-to-b from-black via-blood/40 to-black px-4 py-24 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow={content.pathsSection.eyebrow}
            text={content.pathsSection.text}
            title={content.pathsSection.title}
          />
          <div className="mx-auto grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.paths.map((path, index) => {
              const PathIcon = pathIcons[index % pathIcons.length];

              return (
                <Reveal key={path.title}>
                  <Card className="relative h-full overflow-hidden p-7">
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-magic/10 blur-2xl" />
                    <PathIcon aria-hidden="true" className={cn("mb-5", index % 2 ? "text-cyan-magic" : "text-gold-300")} size={34} />
                    <h3 className="font-fantasy text-2xl font-black text-white">{path.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-neutral-400">{path.description}</p>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {content.chapters[2] ? <ParallaxBand eyebrow={content.chapters[2].eyebrow} icon={visualIcons[content.chapters[2].icon]} title={content.chapters[2].title} /> : null}

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="ranking">
          <SectionTitle
            eyebrow={content.rankingSection.eyebrow}
            text={content.rankingSection.text}
            title={content.rankingSection.title}
          />
          <Reveal>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-gold-300/10 text-xs uppercase tracking-wider text-gold-300">
                    <tr>
                      <th className="p-4">Posición</th>
                      <th className="p-4">Jugador</th>
                      <th className="p-4">Rango</th>
                      <th className="p-4">Facción</th>
                      <th className="p-4">Reputación</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {content.ranking.map((player, index) => (
                      <tr className="border-t border-white/10 transition hover:bg-cyan-magic/5" key={player.id}>
                        <td className="p-4 font-black text-white">
                          <span className="sr-only">Posición {index + 1}</span>
                          {index < 3 ? (
                            <Crown
                              aria-hidden="true"
                              className={cn(index === 0 && "text-gold-300", index === 1 && "text-zinc-300", index === 2 && "text-orange-400")}
                            />
                          ) : (
                            `#${index + 1}`
                          )}
                        </td>
                        <td className="p-4 font-bold text-white">{player.name}</td>
                        <td className="p-4 text-neutral-300">{player.level}</td>
                        <td className="p-4 text-neutral-300">{player.clan}</td>
                        <td className="p-4 text-gold-300">{player.points}</td>
                        <td className="p-4">
                          <span className={cn("rounded-full px-3 py-1 text-xs font-bold", player.online ? "bg-cyan-magic/15 text-cyan-magic" : "bg-neutral-800 text-neutral-400")}>
                            {player.online ? "Online" : "Offline"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <div className="mt-8 text-center">
              <Button href="#comunidad" variant="ghost">
                <Trophy aria-hidden="true" className="mr-2" size={18} />
                Reportar hazañas al staff
              </Button>
            </div>
          </Reveal>
        </section>

        <section className="smoke-texture px-4 py-24 sm:px-6 lg:px-8" id="eventos">
          <SectionTitle
            eyebrow={content.eventsSection.eyebrow}
            text={content.eventsSection.text}
            title={content.eventsSection.title}
          />
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {content.events.map((event, index) => {
              const EventIcon = eventIcons[index % eventIcons.length];

              return (
                <Reveal key={event.id}>
                  <Card className="group h-full overflow-hidden">
                    <div className={cn("relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br", event.tone)}>
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:2rem_2rem] opacity-40" />
                      <EventIcon aria-hidden="true" className="relative text-gold-300 drop-shadow-[0_0_18px_rgba(255,215,0,0.5)] transition duration-300 group-hover:scale-110" size={54} />
                      <span className="absolute right-4 top-4 rounded-full border border-red-300/25 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-red-200">
                        Operación activa
                      </span>
                    </div>
                    <div className="p-6">
                      <p className="text-xs font-black uppercase tracking-wider text-cyan-magic">{event.date}</p>
                      <h3 className="mt-2 font-fantasy text-2xl font-black text-white">{event.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-neutral-400">Objetivo y recompensa: {event.reward}</p>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        </section>

        {content.chapters[3] ? <ParallaxBand eyebrow={content.chapters[3].eyebrow} icon={visualIcons[content.chapters[3].icon]} title={content.chapters[3].title} /> : null}

        <section className="relative px-4 py-24 sm:px-6 lg:px-8" id="descargas">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,229,255,0.14),transparent_30rem)]" />
          <Reveal className="relative mx-auto max-w-5xl">
            <Card className="p-8 text-center md:p-12">
              <Download aria-hidden="true" className="mx-auto mb-5 text-cyan-magic" size={44} />
              <h2 className="font-fantasy text-4xl font-black text-white md:text-6xl">{content.downloadCta.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl leading-8 text-neutral-300">{content.downloadCta.text}</p>
              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button download href={content.config.clientDownloadUrl}>
                  {content.downloadCta.primaryLabel}
                </Button>
                {currentUser ? (
                  <Button href="/cuenta" variant="secondary">
                    <Users aria-hidden="true" className="mr-2" size={18} />
                    Mi Cuenta
                  </Button>
                ) : (
                  <>
                    <Button href="/registro" variant="secondary">
                      Crear Cuenta
                    </Button>
                    <Button href="/login" variant="ghost">
                      Iniciar Sesión
                    </Button>
                  </>
                )}
                <Button download href={content.config.installationGuideUrl} variant="ghost">
                  {content.downloadCta.guideLabel}
                </Button>
              </div>
              <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                {content.downloadCta.requirements.map((req) => (
                  <div className="rounded-xl border border-gold-300/15 bg-black/45 p-4 text-sm font-bold text-neutral-200" key={req}>
                    {req}
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>
        </section>

        <section className="smoke-texture px-4 py-24 sm:px-6 lg:px-8" id="trailer">
          <SectionTitle
            eyebrow={content.trailer.eyebrow}
            text={content.trailer.text}
            title={content.trailer.title}
          />
          <Reveal className="mx-auto max-w-5xl">
            <Card className="overflow-hidden p-2">
              <video className="aspect-video w-full rounded-xl bg-black object-cover" controls playsInline poster={content.trailer.posterUrl} preload="metadata">
                <source src={content.trailer.videoUrl} type="video/mp4" />
                Tu navegador no puede reproducir el tráiler.
              </video>
            </Card>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="galeria">
          <SectionTitle
            eyebrow={content.gallerySection.eyebrow}
            text={content.gallerySection.text}
            title={content.gallerySection.title}
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {content.gallery.map((item, index) => (
              <button
                className="group relative h-64 overflow-hidden rounded-2xl border border-gold-300/15 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-magic"
                key={item.id}
                onClick={() => setSelectedGallery(item)}
                type="button"
              >
                {item.imageUrl ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url("${item.imageUrl.replaceAll('"', "%22")}")` }}
                  />
                ) : null}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br transition duration-500",
                    index % 3 === 0 && "from-gold-300/25 via-black to-crimson/50",
                    index % 3 === 1 && "from-cyan-magic/25 via-black to-blood",
                    index % 3 === 2 && "from-red-950 via-black to-gold-300/20",
                  )}
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="relative flex h-full flex-col justify-end p-6">
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-magic">{item.category}</p>
                  <p className="mt-2 font-fantasy text-3xl font-black text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-neutral-300">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="px-4 py-24 sm:px-6 lg:px-8" id="comunidad">
          <Reveal className="mx-auto max-w-6xl">
            <Card className="relative overflow-hidden p-8 text-center md:p-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(0,229,255,0.24),transparent_28rem)]" />
              <div className="relative">
                <MessageCircle aria-hidden="true" className="mx-auto mb-5 text-cyan-magic" size={52} />
                <h2 className="font-fantasy text-4xl font-black text-white md:text-6xl">{content.communityCta.title}</h2>
                <p className="mx-auto mt-5 max-w-2xl leading-8 text-neutral-300">{content.communityCta.text}</p>
                <Button className="mt-8" href={content.communityCta.buttonHref} rel="noreferrer" target="_blank" variant="secondary">
                  {content.communityCta.buttonLabel}
                </Button>
              </div>
            </Card>
          </Reveal>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8" id="noticias">
          <SectionTitle eyebrow={content.newsSection.eyebrow} text={content.newsSection.text} title={content.newsSection.title} />
          <div className="grid gap-6 md:grid-cols-3">
            {content.news.map((item) => (
              <Reveal key={item.id}>
                <Card className="h-full p-7">
                  <p className="text-xs font-black uppercase tracking-wider text-cyan-magic">
                    {item.category} · {item.date}
                  </p>
                  <h3 className="mt-4 font-fantasy text-2xl font-black text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-neutral-400">{item.summary}</p>
                  <Button className="mt-5 min-h-10 px-5 py-2" href="#comunidad" variant="ghost">
                    Leer más
                  </Button>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8" id="faq">
          <SectionTitle eyebrow={content.faqSection.eyebrow} text={content.faqSection.text} title={content.faqSection.title} />
          <div className="space-y-4">
            {content.faqs.map((faq, index) => (
              <Card className="overflow-hidden" key={faq.question}>
                <button
                  aria-expanded={openFaq === index}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-magic"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  type="button"
                >
                  <span>{faq.question}</span>
                  <ChevronDown aria-hidden="true" className={cn("transition", openFaq === index && "rotate-180")} />
                </button>
                {openFaq === index ? <div className="px-5 pb-5 text-sm leading-7 text-neutral-400">{faq.answer}</div> : null}
              </Card>
            ))}
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-gold-300/15 bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Image alt="Logo TOP ROLEPLAY" height={54} src="/TOP_ROLEPLAY_traced_real.svg" width={54} />
              <span className="font-fantasy text-2xl font-black text-gold-300">TOP ROLEPLAY</span>
            </div>
            <p className="max-w-xl text-sm leading-7 text-neutral-400">{content.footer.description}</p>
          </div>
          <div>
            <p className="mb-4 font-bold uppercase tracking-wider text-white">{content.footer.quickLinksTitle}</p>
            <div className="grid gap-2 text-sm text-neutral-400">
              {content.footer.quickLinks.map((item) => (
                <a className="hover:text-gold-300" href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-4 font-bold uppercase tracking-wider text-white">{content.footer.communityLinksTitle}</p>
            <div className="grid gap-2 text-sm text-neutral-400">
              {currentUser ? (
                <a className="hover:text-gold-300" href="/cuenta">
                  Mi Cuenta · {currentUser.username}
                </a>
              ) : (
                <>
                  <a className="hover:text-gold-300" href="/login">
                    Iniciar Sesión
                  </a>
                  <a className="hover:text-gold-300" href="/registro">
                    Crear Cuenta
                  </a>
                </>
              )}
              {content.footer.communityLinks.map((item) => (
                <a className="hover:text-cyan-magic" href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-7xl text-xs text-neutral-500">{content.footer.copyright}</p>
      </footer>

      {selectedGallery ? (
        <div
          aria-label={`Galería ${selectedGallery.title}`}
          aria-modal="true"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
          onClick={() => setSelectedGallery(null)}
          role="dialog"
        >
          <div
            className="relative h-[70vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-gold-300/30 bg-gradient-to-br from-blood via-black to-cyan-magic/20 p-8"
            onClick={(event) => event.stopPropagation()}
          >
            {selectedGallery.imageUrl ? (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url("${selectedGallery.imageUrl.replaceAll('"', "%22")}")` }}
              />
            ) : null}
            <div className="absolute inset-0 bg-black/55" />
            <button
              aria-label="Cerrar galería"
              className="absolute right-4 top-4 z-10 rounded-full border border-white/20 bg-black/50 p-2 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-magic"
              onClick={() => setSelectedGallery(null)}
              ref={closeModalRef}
              type="button"
            >
              <X aria-hidden="true" />
            </button>
            <div className="relative z-10 flex h-full items-center justify-center">
              <div className="text-center">
                <Map className="mx-auto mb-5 text-gold-300" size={74} />
                <h3 className="font-fantasy text-5xl font-black text-white">{selectedGallery.title}</h3>
                <p className="mt-4 text-neutral-300">{selectedGallery.description}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
