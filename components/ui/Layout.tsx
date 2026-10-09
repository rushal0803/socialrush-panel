import type { HTMLAttributes, ReactNode } from "react";

type ContainerSize = "content" | "narrow" | "wide";

export type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
  children?: ReactNode;
};

const sizeClasses: Record<ContainerSize, string> = {
  content: "max-w-sr-content",
  narrow: "max-w-4xl",
  wide: "max-w-[90rem]",
};

export function Container({
  className = "",
  size = "content",
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={[
        "mx-auto min-w-0 w-full px-[var(--sr-page-gutter)]",
        sizeClasses[size],
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

export type SectionProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
};

export function Section({ className = "", children, ...props }: SectionProps) {
  return (
    <section
      className={["py-[var(--sr-section-space)]", className].filter(Boolean).join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}
