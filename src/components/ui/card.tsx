import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "neon-border city-panel district-glow rounded-2xl border border-gold-300/15 shadow-2xl shadow-black/40 backdrop-blur-sm transition duration-300 hover:border-gold-300/30 hover:shadow-[0_24px_70px_rgb(0_0_0_/_0.5),0_0_30px_rgb(255_215_0_/_0.08)]",
        className,
      )}
      {...props}
    />
  );
}
