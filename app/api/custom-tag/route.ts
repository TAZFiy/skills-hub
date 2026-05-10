import { NextResponse } from "next/server";

import { readCustomSkills, writeCustomSkills } from "@/src/lib/config/custom-skills-store";

export async function GET() {
  const names = await readCustomSkills();
  return NextResponse.json({ names });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const { skillName } = payload ?? {};
  if (typeof skillName !== "string" || !skillName) {
    return NextResponse.json({ ok: false, error: "Missing skillName" }, { status: 400 });
  }
  const names = await readCustomSkills();
  if (!names.includes(skillName)) {
    await writeCustomSkills([...names, skillName]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const { skillName } = payload ?? {};
  if (typeof skillName !== "string" || !skillName) {
    return NextResponse.json({ ok: false, error: "Missing skillName" }, { status: 400 });
  }
  const names = await readCustomSkills();
  await writeCustomSkills(names.filter((n) => n !== skillName));
  return NextResponse.json({ ok: true });
}
