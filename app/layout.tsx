import type { Metadata } from "next";

import "./globals.css";
import { AppShell } from "@/src/components/app-shell";

export const metadata: Metadata = {
  title: "技能中心",
  description: "一个桌面式工作区，统一管理技能安装以及 Claude Code / Codex 全局规则"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
