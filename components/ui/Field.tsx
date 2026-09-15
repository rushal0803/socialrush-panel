import type { InputHTMLAttributes, ReactNode } from "react";

export type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Field({
  className = "",
  label,
  hint,
  error,
  leading,
  trailing,
  id,
  name,
  disabled,
  ...props
}: FieldProps) {
  const inputId = id ?? name;
  const describedBy = error
    ? inputId
      ? `${inputId}-error`
      : undefined
    : hint && inputId
      ? `${inputId}-hint`
      : undefined;

  return (
    <label className="block text-sm font-semibold text-content-primary" htmlFor={inputId}>
      {label ? <span className="mb-2 block">{label}</span> : null}
      <span className="relative block">
        {leading ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-content-muted">
            {leading}
          </span>
        ) : null}
        <input
          id={inputId}
          name={name}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            "min-h-12 w-full rounded-sr-control border bg-surface-elevated px-4 py-3 text-sm font-normal text-content-primary outline-none",
            "placeholder:text-content-muted transition-[border-color,box-shadow,background-color] duration-fast ease-sr-out",
            "focus:border-action-bright/70 focus:shadow-sr-focus disabled:cursor-not-allowed disabled:opacity-55",
            error ? "border-state-danger/70" : "border-sr-border hover:border-white/15",
            leading ? "pl-10" : "",
            trailing ? "pr-10" : "",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {trailing ? (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-content-muted">
            {trailing}
          </span>
        ) : null}
      </span>
      {error ? (
        <span id={inputId ? `${inputId}-error` : undefined} className="mt-2 block text-xs font-medium text-red-300">
          {error}
        </span>
      ) : hint ? (
        <span id={inputId ? `${inputId}-hint` : undefined} className="mt-2 block text-xs font-normal text-content-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
