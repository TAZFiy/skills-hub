import { NextResponse } from "next/server";

import { readSkillCategories, setSkillCategories } from "@/src/lib/config/skill-categories-store";

export async function GET() {
  const map = await readSkillCategories();
  return NextResponse.json(map);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      skillName: string;
      categoryIds: string[];
    };
    if (typeof body.skillName !== "string" || !body.skillName) {
      return NextResponse.json(
        { error: "Missing skillName" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.categoryIds)) {
      return NextResponse.json(
        { error: "categoryIds must be an array" },
        { status: 400 }
      );
    }
    await setSkillCategories(body.skillName, body.categoryIds);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[skill-categories] POST error:", err);
    return NextResponse.json(
      { error: "更新分类失败" },
      { status: 500 }
    );
  }
}
