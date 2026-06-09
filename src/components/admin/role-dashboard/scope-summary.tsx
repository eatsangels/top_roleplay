import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

export type ScopeSummaryItem = {
  id: string;
  label: string;
  description?: string;
  value?: string | number;
  access?: "manage" | "write" | "read";
  icon?: ElementType;
};

export type ScopeSummaryProps = {
  title: string;
  description?: string;
  items: ScopeSummaryItem[];
};

const accessLabels = { manage: "Control total", write: "Edición", read: "Lectura" };
const accessStyles = {
  manage: "bg-gold-300/15 text-gold-300",
  write: "bg-cyan-magic/15 text-cyan-magic",
  read: "bg-white/10 text-neutral-400",
};

export function ScopeSummary({ title, description, items }: ScopeSummaryProps) {
  return (
    <Card className="p-5">
      <h2 className="font-fantasy text-xl font-black text-white">{title}</h2>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="rounded-xl border border-white/10 bg-black/35 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-gold-300/20" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  {Icon ? <Icon aria-hidden="true" className="shrink-0 text-cyan-magic" size={19} /> : null}
                  <p className="font-bold text-white">{item.label}</p>
                </div>
                {item.value !== undefined ? <span className="font-fantasy text-xl font-black text-gold-300">{item.value}</span> : null}
              </div>
              {item.description ? <p className="mt-2 text-xs leading-5 text-neutral-500">{item.description}</p> : null}
              {item.access ? (
                <span className={cn("mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide", accessStyles[item.access])}>
                  {accessLabels[item.access]}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
