import { NextResponse } from "next/server";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function GET() {
  const model = await buildOverviewModel();

  return NextResponse.json({
    agents: model.agents,
    stateSummary: model.stateSummary,
    syncSummary: model.syncPlan.summary,
    totalSkills: model.skills.length
  });
}
