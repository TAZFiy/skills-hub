import { NextResponse } from "next/server";

import { buildInstructionsModel } from "@/src/lib/server/build-instructions-model";

export async function GET() {
  const model = await buildInstructionsModel();
  return NextResponse.json(model);
}
