"use client";

import { Sidebar } from "@/src/components/ui/sidebar";
import { ToastProvider } from "@/src/components/ui/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="app-shell">
        <Sidebar />
        <div className="main">{children}</div>
      </div>
    </ToastProvider>
  );
}
