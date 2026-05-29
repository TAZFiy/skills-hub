import { readFile } from "node:fs/promises";

export async function readPreview(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}
