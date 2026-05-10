import { NextResponse } from "next/server";
import { z } from "zod";

import {
  SaveInstructionError,
  updateInstructionAsset
} from "@/src/lib/instructions/save-instruction-asset";

const requestSchema = z.object({
  path: z.string(),
  content: z.string(),
  previousHash: z.string().nullable()
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "请求参数无效。" }, { status: 400 });
  }

  try {
    const result = await updateInstructionAsset(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SaveInstructionError) {
      return NextResponse.json(
        { ok: false, code: error.code, error: error.message },
        { status: error.code === "STALE_CONTENT" ? 409 : 400 }
      );
    }

    return NextResponse.json({ ok: false, error: "更新失败。" }, { status: 500 });
  }
}
