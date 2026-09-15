import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-action-gold/20 bg-sr-brand text-white shadow-sr-button hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(255,118,0,0.28)]",
  secondary:
    "border border-sr-border bg-surface-secondary text-content-primary hover:border-sr-border-strong hover:bg-action/10",
  ghost:
    "border border-transparent bg-transparent text-content-secondary hover:border-sr-border hover:bg-white/[0.04] hover:text-content-primary",
  danger:
    "border border-state-danger/30 bg-state-danger/10 text-red-200 hover:border-state-danger/50 hover:bg-state-danger/15",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-3 py-2 text-xs",
  md: "min-h-11 rounded-sr-control px-5 py-3 text-sm",
  lg: "min-h-12 rounded-sr-control px-6 py-3.5 text-sm",
};

export function Button({
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  type,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type ?? "button"}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex items-center justify-center gap-2 font-bold transition-all duration-normal ease-sr-out",
        "focus-visible:outline-none focus-visible:shadow-sr-focus",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55",
        "motion-reduce:transform-none motion-reduce:transition-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
