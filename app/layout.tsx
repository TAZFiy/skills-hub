import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { AppShell } from "@/src/components/app-shell";

const bodyFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

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
      <body className={`${bodyFont.variable} ${monoFont.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
