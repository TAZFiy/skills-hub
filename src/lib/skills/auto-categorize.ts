import type { Category } from "@/src/types/categories";

export function autoCategorize(
  name: string,
  description: string,
  categories: Category[]
): string[] {
  const text = `${name} ${description}`.toLowerCase();
  return categories
    .filter((cat) => {
      if (!cat.keywords || cat.keywords.length === 0) return false;
      return cat.keywords.some((kw) => text.includes(kw.toLowerCase()));
    })
    .map((cat) => cat.id);
}
