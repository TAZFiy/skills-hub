import { readFile } from "node:fs/promises";
import matter from "gray-matter";

export async function readSkillFrontmatter(skillFilePath: string) {
  const content = await readFile(skillFilePath, "utf8");
  const parsed = matter(content);
  return {
    content,
    data: parsed.data as {
      name?: string;
      description?: string;
    }
  };
}
