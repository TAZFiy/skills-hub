import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { scanCodexInstructions } from "@/src/lib/instructions/scan-codex-instructions";

const tempDirs: string[] = [];

describe("scanCodexInstructions", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map(async (dir) =>
        import("node:fs/promises").then(({ rm }) => rm(dir, { recursive: true, force: true }))
      )
    );
  });

  it("returns only codex root instruction files", async () => {
    const result = await scanCodexInstructions(
      "/Users/liuxingqi/ai_lab/skills_hub/tests/fixtures/instructions/codex-project"
    );

    expect(result.assets.filter((asset) => asset.kind === "main")).toHaveLength(1);
    expect(result.assets).toHaveLength(1);
    expect(result.assets.filter((asset) => asset.kind === "nested")).toHaveLength(0);
    expect(result.assets.find((asset) => asset.kind === "main")?.scope).toBe("user");
    expect(result.summary.nestedFiles).toBe(0);
  });

  it("keeps the main instruction in stable position", async () => {
    const result = await scanCodexInstructions(
      "/Users/liuxingqi/ai_lab/skills_hub/tests/fixtures/instructions/codex-project"
    );

    expect(result.assets[0]?.path.endsWith("/AGENTS.md")).toBe(true);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0]?.priority).toBe(0);
  });

  it("treats empty files as existing instructions", async () => {
    const root = await mkdtemp(join(tmpdir(), "scan-codex-empty-"));
    tempDirs.push(root);
    await mkdir(root, { recursive: true });
    await writeFile(join(root, "AGENTS.md"), "", "utf8");

    const result = await scanCodexInstructions(root);
    const main = result.assets.find((asset) => asset.kind === "main");

    expect(main?.exists).toBe(true);
    expect(main?.status).toBe("found");
    expect(main?.canCreate).toBe(false);
    expect(main?.contentPreview).toBe("");
  });
});
