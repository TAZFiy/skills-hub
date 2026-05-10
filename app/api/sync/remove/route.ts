import { rm } from "node:fs/promises";

import { NextResponse } from "next/server";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function DELETE(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const { skillName } = payload ?? {};

  if (typeof skillName !== "string") {
    return NextResponse.json({ ok: false, error: "Missing skillName" }, { status: 400 });
  }

  const model = await buildOverviewModel();
  const installedPaths = Object.values(model.agentStates)
    .flat()
    .filter((s) => s.skillName === skillName && s.exists)
    .map((s) => s.targetPath);

  if (installedPaths.length === 0) {
    return NextResponse.json({ ok: false, error: "Skill is not installed in any agent" }, { status: 404 });
  }

  await Promise.all(installedPaths.map((p) => rm(p, { recursive: true, force: true })));

  return NextResponse.json({ ok: true, removed: installedPaths });
}
