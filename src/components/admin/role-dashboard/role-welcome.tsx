import { Card } from "@/components/ui/card";
import type { ElementType, ReactNode } from "react";

export type RoleWelcomeProps = {
  eyebrow?: string;
  title: string;
  description: string;
  roleLabel: string;
  icon?: ElementType;
  details?: ReactNode;
};

export function RoleWelcome({
  eyebrow = "Panel por rol",
  title,
  description,
  roleLabel,
  icon: Icon,
  details,
}: RoleWelcomeProps) {
  return (
    <Card className="relative overflow-hidden p-6 md:p-7">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.12),transparent_65%)]" />
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-gold-300/15" />
      <div className="absolute -right-6 top-10 h-20 w-20 rotate-45 border border-cyan-magic/10" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-magic">{eyebrow}</p>
          <h1 className="mt-3 font-fantasy text-3xl font-black text-white md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-neutral-400">{description}</p>
          {details ? <div className="mt-5 text-sm text-neutral-300">{details}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-gold-300/25 bg-gold-300/10 px-4 py-3">
          {Icon ? <Icon aria-hidden="true" className="text-gold-300" size={22} /> : null}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Rol activo</p>
            <p className="mt-1 font-bold text-gold-300">{roleLabel}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
