import { Card } from "@/components/ui/card";
import Link from "next/link";
import type { ElementType } from "react";

export type QuickAction = {
  id: string;
  label: string;
  description?: string;
  href: string;
  icon?: ElementType;
};

export type QuickActionsProps = {
  title: string;
  description?: string;
  actions: QuickAction[];
  emptyMessage?: string;
};

export function QuickActions({ title, description, actions, emptyMessage = "No hay acciones disponibles para este rol." }: QuickActionsProps) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-gold-300/5" />
      <h2 className="font-fantasy text-xl font-black text-white">{title}</h2>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-5 grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              className="group flex items-center gap-3 rounded-xl border border-gold-300/15 bg-black/30 p-4 transition hover:border-cyan-magic/35 hover:bg-cyan-magic/10"
              href={action.href}
              key={action.id}
            >
              {Icon ? (
                <div className="rounded-lg bg-black/40 p-2 text-gold-300 transition group-hover:text-cyan-magic">
                  <Icon aria-hidden="true" size={18} />
                </div>
              ) : null}
              <div>
                <p className="font-bold text-white">{action.label}</p>
                {action.description ? <p className="mt-0.5 text-xs leading-5 text-neutral-500">{action.description}</p> : null}
              </div>
            </Link>
          );
        })}
        {actions.length === 0 ? <p className="py-6 text-center text-sm text-neutral-500">{emptyMessage}</p> : null}
      </div>
    </Card>
  );
}
