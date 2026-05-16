"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type SidebarItem = {
  href: Route;
  label: string;
  eyebrow: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function SidebarNav({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="nav-list" aria-label="Primary">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="nav-link"
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-link-icon">
              <Icon size={18} />
            </span>
            <span className="nav-link-copy">
              <span className="nav-link-eyebrow">{item.eyebrow}</span>
              <span className="nav-link-label">{item.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
