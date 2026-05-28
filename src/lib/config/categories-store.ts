import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Category } from "@/src/types/categories";

const CATEGORIES_PATH = path.resolve(process.cwd(), "config/categories.json");

export async function readCategories(): Promise<Category[]> {
  try {
    const raw = await readFile(CATEGORIES_PATH, "utf-8");
    return JSON.parse(raw) as Category[];
  } catch {
    return [];
  }
}

export async function writeCategories(categories: Category[]): Promise<void> {
  await writeFile(CATEGORIES_PATH, JSON.stringify(categories, null, 2), "utf-8");
}
