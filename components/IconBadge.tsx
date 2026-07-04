import type { ReactNode } from "react";

type IconBadgeProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-10 w-10 rounded-xl [&>svg]:h-5 [&>svg]:w-5",
  md: "h-14 w-14 rounded-2xl [&>svg]:h-6 [&>svg]:w-6",
  lg: "h-[60px] w-[60px] rounded-2xl [&>svg]:h-7 [&>svg]:w-7",
} as const;

export default function IconBadge({
  children,
  className = "",
  label,
  size = "md",
}: IconBadgeProps) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center bg-gradient-to-br from-[#FF6A00] to-[#FF9F00] text-white shadow-[0_12px_28px_rgba(255,106,0,.3)] ${sizes[size]} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {children}
    </span>
  );
}
