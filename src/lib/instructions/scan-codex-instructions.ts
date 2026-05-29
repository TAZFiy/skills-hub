import { homedir } from "node:os";
import { join } from "node:path";

import { hashInstructionContent } from "@/src/lib/instructions/hash-instruction-content";
import { readPreview } from "@/src/lib/instructions/read-preview";
import type { InstructionAsset, InstructionSurface } from "@/src/types/instructions";

export async function scanCodexInstructions(
  codexRootDir: string = process.env.CODEX_HOME || join(homedir(), ".codex")
): Promise<InstructionSurface> {
  const rootMain = join(codexRootDir, "AGENTS.md");
  const rootMainContent = await readPreview(rootMain);

  const assets: InstructionAsset[] = [
    {
      id: "codex:AGENTS.md",
      agent: "codex",
      kind: "main",
      scope: "user",
      status: rootMainContent !== null ? "found" : "missing",
      path: rootMain,
      exists: rootMainContent !== null,
      title: `${codexRootDir}/AGENTS.md`,
      description: "Codex 的全局 AGENTS 指令文件。",
      loadBehavior: "作为 Codex 的用户级基础说明，对本机上的 Codex 工作区提供默认行为约束。",
      priority: 0,
      parentPath: null,
      contentPreview: rootMainContent,
      contentHash: rootMainContent !== null ? hashInstructionContent(rootMainContent) : null,
      isEditable: true,
      canCreate: false
    }
  ];

  return {
    agent: "codex",
    rootPath: codexRootDir,
    assets,
    summary: {
      mainFiles: assets.filter((asset) => asset.kind === "main" && asset.exists).length,
      ruleFiles: 0,
      nestedFiles: 0,
      recommendedMissingFiles: assets.filter((asset) => !asset.exists).length
    }
  };
}
