import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type BaseButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  BaseButtonProps & {
    href?: undefined;
  };

type AnchorButtonProps = BaseButtonProps & {
    href: string;
    download?: boolean | string;
    target?: string;
    rel?: string;
    "aria-label"?: string;
  };

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-gold-300/60 bg-gradient-to-r from-gold-300 via-gold-500 to-crimson text-black shadow-[0_0_32px_rgb(212_175_55_/_0.35)] hover:shadow-[0_0_52px_rgb(0_229_255_/_0.24)]",
  secondary:
    "border border-cyan-magic/35 bg-cyan-magic/10 text-cyan-magic backdrop-blur-md hover:border-cyan-magic/70 hover:bg-cyan-magic/15 hover:text-white",
  ghost:
    "border border-gold-300/25 bg-black/45 text-gold-300 hover:border-gold-300/55 hover:bg-gold-300/10",
};

export function Button(props: ButtonProps | AnchorButtonProps) {
  const { className, children, variant = "primary" } = props;
  const classes = cn(
        "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-xl px-8 py-4 text-sm font-black uppercase tracking-wide transition duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-magic focus-visible:ring-4 focus-visible:ring-cyan-magic/15",
        variants[variant],
        className,
  );

  if ("href" in props && props.href) {
    return (
      <a
        aria-label={props["aria-label"]}
        className={classes}
        download={props.download}
        href={props.href}
        rel={props.rel}
        target={props.target}
      >
        {variant === "primary" ? (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
        ) : null}
        <span className="relative">{children}</span>
      </a>
    );
  }

  const buttonProps = props as ButtonProps;
  const buttonType = buttonProps.type ?? "button";

  return (
    <button
      aria-label={buttonProps["aria-label"]}
      className={classes}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      type={buttonType}
    >
      {variant === "primary" ? (
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-white/25 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
      ) : null}
      <span className="relative">{children}</span>
    </button>
  );
}
