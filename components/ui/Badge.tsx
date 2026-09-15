import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "neutral" | "brand" | "success" | "warning" | "danger";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  dot?: boolean;
  children?: ReactNode;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-sr-border bg-white/[0.04] text-content-secondary",
  brand: "border-action/25 bg-action/10 text-orange-200",
  success: "border-state-success/25 bg-state-success/10 text-emerald-200",
  warning: "border-state-warning/25 bg-state-warning/10 text-amber-200",
  danger: "border-state-danger/25 bg-state-danger/10 text-red-200",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-content-muted",
  brand: "bg-action-bright",
  success: "bg-state-success",
  warning: "bg-state-warning",
  danger: "bg-state-danger",
};

export function Badge({
  className = "",
  tone = "neutral",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {dot ? <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dotClasses[tone]}`} /> : null}
      {children}
    </span>
  );
}
