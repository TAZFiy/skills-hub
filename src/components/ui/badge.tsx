import type { ReactNode } from "react";

type BadgeVariant = "self" | "opensource" | "custom";

type BadgeProps = {
  variant: BadgeVariant;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  self: "badge badge-self",
  opensource: "badge badge-opensource",
  custom: "badge badge-cat",
};

export function Badge({ variant, children, className = "", style }: BadgeProps) {
  return (
    <span className={VARIANT_CLASS[variant] + " " + className} style={style}>
      {children}
    </span>
  );
}
