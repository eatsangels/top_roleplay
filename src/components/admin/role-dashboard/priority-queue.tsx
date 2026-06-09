import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ElementType, ReactNode } from "react";

export type QueuePriority = "critical" | "high" | "medium" | "low";

export type PriorityQueueItem = {
  id: string;
  title: string;
  description?: string;
  priority: QueuePriority;
  status?: string;
  meta?: ReactNode;
  href?: string;
  icon?: ElementType;
};

export type PriorityQueueProps = {
  title: string;
  description?: string;
  items: PriorityQueueItem[];
  emptyMessage?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

const priorityStyles: Record<QueuePriority, string> = {
  critical: "border-red-400/30 bg-red-500/10 text-red-300",
  high: "border-orange-400/30 bg-orange-500/10 text-orange-300",
  medium: "border-yellow-400/30 bg-yellow-500/10 text-yellow-300",
  low: "border-cyan-magic/30 bg-cyan-magic/10 text-cyan-magic",
};

export function PriorityQueue({
  title,
  description,
  items,
  emptyMessage = "No hay elementos pendientes.",
  viewAllHref,
  viewAllLabel = "Ver todos",
}: PriorityQueueProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-gold-300/15 p-5">
        <div>
          <h2 className="font-fantasy text-xl font-black text-white">{title}</h2>
          {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
        </div>
        <span className="rounded-full bg-cyan-magic/10 px-3 py-1 text-xs font-black text-cyan-magic">{items.length}</span>
      </div>
      <div className="divide-y divide-white/10">
        {items.map((item) => {
          const Icon = item.icon;
          const content = (
            <div className="flex items-start gap-4 p-4 transition hover:bg-cyan-magic/5">
              {Icon ? (
                <div className="rounded-xl border border-white/10 bg-black/35 p-2.5 text-cyan-magic">
                  <Icon aria-hidden="true" size={18} />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-white">{item.title}</p>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide", priorityStyles[item.priority])}>
                    {item.priority}
                  </span>
                  {item.status ? <span className="text-xs font-bold text-neutral-500">{item.status}</span> : null}
                </div>
                {item.description ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-400">{item.description}</p> : null}
                {item.meta ? <div className="mt-2 text-xs text-neutral-500">{item.meta}</div> : null}
              </div>
            </div>
          );

          return item.href ? <Link href={item.href} key={item.id}>{content}</Link> : <div key={item.id}>{content}</div>;
        })}
        {items.length === 0 ? <p className="p-8 text-center text-sm text-neutral-500">{emptyMessage}</p> : null}
      </div>
      {viewAllHref ? (
        <div className="border-t border-white/10 p-4 text-right">
          <Link className="text-sm font-bold text-gold-300 hover:text-cyan-magic" href={viewAllHref}>{viewAllLabel}</Link>
        </div>
      ) : null}
    </Card>
  );
}
