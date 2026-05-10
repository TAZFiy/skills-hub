import { NextResponse } from "next/server";

import { applySyncPlan } from "@/src/lib/sync/apply-sync-plan";
import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const model = await buildOverviewModel();
  const filteredPlan = {
    ...model.syncPlan,
    actions: model.syncPlan.actions.filter((action) => {
      const matchesSkill =
        typeof payload?.skillName === "string" ? action.skillName === payload.skillName : true;
      const matchesType = Array.isArray(payload?.types)
        ? payload.types.includes(action.type)
        : true;
      return matchesSkill && matchesType;
    })
  };
  const result = await applySyncPlan(filteredPlan, {
    pruneOrphans: Boolean(payload?.pruneOrphans),
    allowedSourceRoots: model.agents.map((a) => a.skillsPath)
  });

  return NextResponse.json(result);
}
