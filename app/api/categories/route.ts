import { NextResponse } from "next/server";
import { readCategories, writeCategories } from "@/src/lib/config/categories-store";
import type { Category } from "@/src/types/categories";

export async function GET() {
  const categories = await readCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<Category>;
    if (!body.name?.trim()) {
      return NextResponse.json({ error: "名称不能为空" }, { status: 400 });
    }

    const categories = await readCategories();
    const maxOrder = categories.length > 0
      ? Math.max(...categories.map((c) => c.order))
      : 0;

    const newCategory: Category = {
      id: "cat-" + Date.now().toString(36),
      name: body.name.trim(),
      icon: body.icon || "📦",
      desc: body.desc?.trim() || "",
      color: body.color || "oklch(55% 0.02 240)",
      order: maxOrder + 1,
      isPreset: false,
      keywords: [],
    };

    categories.push(newCategory);
    await writeCategories(categories);
    return NextResponse.json(newCategory, { status: 201 });
  } catch {
    return NextResponse.json({ error: "创建分类失败" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Category;
    if (!body.id || !body.name?.trim()) {
      return NextResponse.json({ error: "参数无效" }, { status: 400 });
    }

    const categories = await readCategories();
    const index = categories.findIndex((c) => c.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "分类不存在" }, { status: 404 });
    }

    categories[index] = { ...categories[index], ...body, name: body.name.trim() };
    await writeCategories(categories);
    return NextResponse.json(categories[index]);
  } catch {
    return NextResponse.json({ error: "更新分类失败" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少 id 参数" }, { status: 400 });
    }

    let categories = await readCategories();
    categories = categories.filter((c) => c.id !== id);
    await writeCategories(categories);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "删除分类失败" }, { status: 500 });
  }
}
