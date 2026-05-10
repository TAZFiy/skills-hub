import { NextResponse } from "next/server";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";

export async function GET() {
  const model = await buildOverviewModel();

  return NextResponse.json(model.syncPlan);
}
