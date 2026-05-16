import { NextResponse } from "next/server";

import { loadAgents } from "@/src/lib/config/load-agents";
import { installSkillSource } from "@/src/lib/skills/install-skill-source";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const source = typeof payload?.source === "string" ? payload.source : "";

  if (!source.trim()) {
    return NextResponse.json(
      { error: "请输入 GitHub skill 项目地址或本地目录。" },
      { status: 400 }
    );
  }

  try {
    const agents = await loadAgents();
    const result = await installSkillSource(source, agents);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "安装失败。" },
      { status: 400 }
    );
  }
}
