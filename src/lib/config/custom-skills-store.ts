import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const STORE_PATH = join(process.cwd(), "config", "custom-skills.json");

export async function readCustomSkills(): Promise<string[]> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeCustomSkills(names: string[]): Promise<void> {
  await writeFile(STORE_PATH, JSON.stringify([...new Set(names)].sort(), null, 2) + "\n", "utf8");
}
