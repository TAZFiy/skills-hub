import { z } from "zod";
import { NextResponse } from "next/server";

import { readSkillCategories, setSkillCategories } from "@/src/lib/config/skill-categories-store";

const postBodySchema = z.object({
  skillName: z.string().min(1),
  categoryIds: z.array(z.string()),
});

export async function GET() {
  const map = await readSkillCategories();
  return NextResponse.json(map);
}

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const body = postBodySchema.parse(raw);
    await setSkillCategories(body.skillName, body.categoryIds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues.map((e) => e.message).join(", ") },
        { status: 400 }
      );
    }
    console.warn("[skill-categories] POST failed");
    return NextResponse.json(
      { error: "更新分类失败" },
      { status: 500 }
    );
  }
}
