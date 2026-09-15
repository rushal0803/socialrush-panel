import type { HTMLAttributes, ReactNode } from "react";

type SurfaceTone = "default" | "subtle" | "brand";

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  tone?: SurfaceTone;
  interactive?: boolean;
  children?: ReactNode;
};

const toneClasses: Record<SurfaceTone, string> = {
  default:
    "border-sr-border bg-[linear-gradient(145deg,rgba(21,24,33,0.96),rgba(12,14,20,0.96))]",
  subtle: "border-sr-border bg-surface-elevated",
  brand:
    "border-action/20 bg-[linear-gradient(145deg,rgba(255,118,0,0.10),rgba(16,18,25,0.96)_48%)]",
};

export function Surface({
  className = "",
  tone = "default",
  interactive = false,
  children,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={[
        "rounded-sr-card border shadow-sr-card",
        toneClasses[tone],
        interactive
          ? "transition-[transform,box-shadow,border-color,background-color] duration-normal ease-sr-out hover:-translate-y-0.5 hover:border-sr-border-strong hover:shadow-[0_24px_60px_-34px_rgba(255,118,0,0.28)] focus-within:border-sr-border-strong motion-reduce:transform-none motion-reduce:transition-none"
          : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
