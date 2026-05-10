import { describe, expect, it } from "vitest";

import { scanClaudeInstructions } from "@/src/lib/instructions/scan-claude-instructions";

describe("scanClaudeInstructions", () => {
  it("finds only the global Claude root file", async () => {
    const result = await scanClaudeInstructions(
      "/Users/liuxingqi/ai_lab/skills_hub/tests/fixtures/instructions/claude-project/.claude"
    );

    expect(result.assets.some((asset) => asset.path.endsWith("/.claude/CLAUDE.md") && asset.exists)).toBe(true);
    expect(result.assets).toHaveLength(1);
    expect(result.assets.every((asset) => asset.kind === "main")).toBe(true);
    expect(result.assets.find((asset) => asset.kind === "main")?.scope).toBe("user");
    expect(result.assets.find((asset) => asset.kind === "main")?.isEditable).toBe(true);
    expect(result.summary.ruleFiles).toBe(0);
  });
});
