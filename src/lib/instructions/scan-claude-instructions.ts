import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, relative } from "node:path";

import { hashInstructionContent } from "@/src/lib/instructions/hash-instruction-content";
import type { InstructionAsset, InstructionSurface } from "@/src/types/instructions";

async function readPreview(path: string) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

function buildId(rootPath: string, path: string) {
  return `claude:${relative(rootPath, path) || "root"}`;
}

export async function scanClaudeInstructions(
  claudeRootDir: string = join(homedir(), ".claude")
): Promise<InstructionSurface> {
  const rootFile = join(claudeRootDir, "CLAUDE.md");
  const rootContent = await readPreview(rootFile);

  const assets: InstructionAsset[] = [
    {
      id: buildId(claudeRootDir, rootFile),
      agent: "claude",
      kind: "main",
      scope: "user",
      status: rootContent !== null ? "found" : "missing",
      path: rootFile,
      exists: rootContent !== null,
      title: "~/.claude/CLAUDE.md",
      description: "Claude Code 的用户级全局指令文件。",
      loadBehavior: "对这台机器上的所有 Claude Code 项目生效，适合放个人级偏好和长期工作流。",
      priority: 0,
      parentPath: null,
      contentPreview: rootContent,
      contentHash: rootContent !== null ? hashInstructionContent(rootContent) : null,
      isEditable: true,
      canCreate: false
    }
  ];

  return {
    agent: "claude",
    rootPath: claudeRootDir,
    assets,
    summary: {
      mainFiles: assets.filter((asset) => asset.kind === "main" && asset.exists).length,
      ruleFiles: 0,
      nestedFiles: 0,
      recommendedMissingFiles: assets.filter((asset) => !asset.exists).length
    }
  };
}
