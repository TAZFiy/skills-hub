import { NextResponse } from "next/server";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function GET() {
  const model = await buildOverviewModel();

  return NextResponse.json({
    agents: model.agents,
    rows: model.registryRows
  });
}
