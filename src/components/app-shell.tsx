"use client";

import { FileStack, FolderTree, LayoutGrid } from "lucide-react";

import { SidebarNav } from "@/src/components/sidebar-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand-shell">
          <div className="brand-mark">
            <FolderTree size={18} />
          </div>
          <div className="topbar-brand">
            <h1 className="brand-name">Skills Hub</h1>
            <p className="topbar-copy">skills 与全局规则</p>
          </div>
        </div>
      </header>
      <div className="content-shell content-shell-wide shell-grid">
        <aside className="shell-nav">
          <SidebarNav
            items={[
              {
                href: "/",
                label: "技能管理",
                eyebrow: "Skills",
                icon: LayoutGrid
              },
              {
                href: "/instructions",
                label: "全局规则",
                eyebrow: "Global Rules",
                icon: FileStack
              }
            ]}
          />
        </aside>
        <div>{children}</div>
      </div>
    </div>
  );
}
