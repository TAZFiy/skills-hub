import Link from "next/link";
import type { Route } from "next";

export function ActionLink({
  href,
  children,
  icon: Icon,
  variant = "solid"
}: {
  href: Route;
  children: React.ReactNode;
  icon: React.ComponentType<{ size?: number }>;
  variant?: "solid" | "ghost";
}) {
  return (
    <Link href={href} className="action-link" data-variant={variant}>
      <Icon size={16} />
      {children}
    </Link>
  );
}
