import { rm } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function DELETE(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const { skillName } = payload ?? {};

  if (typeof skillName !== "string") {
    return NextResponse.json({ ok: false, error: "Missing skillName" }, { status: 400 });
  }

  const model = await buildOverviewModel();
  const agentById = new Map(model.agents.map((a) => [a.id, a]));

  const installedPaths: string[] = [];
  for (const state of Object.values(model.agentStates).flat()) {
    if (state.skillName === skillName && state.exists) {
      const resolvedTarget = path.resolve(state.targetPath);
      const agent = agentById.get(state.agentId);
      if (!agent) continue;
      const resolvedRoot = path.resolve(agent.skillsPath);
      if (!resolvedTarget.startsWith(resolvedRoot + path.sep)) {
        throw new Error(`Path traversal detected: ${state.targetPath}`);
      }
      installedPaths.push(resolvedTarget);
    }
  }

  if (installedPaths.length === 0) {
    return NextResponse.json({ ok: false, error: "Skill is not installed in any agent" }, { status: 404 });
  }

  await Promise.all(installedPaths.map((p) => rm(p, { recursive: true, force: true })));

  return NextResponse.json({ ok: true, removed: installedPaths });
}
