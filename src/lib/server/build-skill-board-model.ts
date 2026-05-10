import { readFile } from "node:fs/promises";

import { buildOverviewModel } from "@/src/lib/server/build-overview-model";
import { readCustomSkills } from "@/src/lib/config/custom-skills-store";
import type { SkillBoardCell, SkillBoardModel, SkillBoardRow } from "@/src/types/board";
import type { InstallStatus } from "@/src/types/skills";

const DISPLAY_STATUS: Record<InstallStatus, SkillBoardCell["displayStatus"]> = {
  synced: "installed",
  missing: "missing",
  drifted: "broken",
  conflict: "broken",
  orphaned: "installed"
};

async function readSkillContent(skillFilePath: string) {
  try {
    return await readFile(skillFilePath, "utf8");
  } catch {
    return "未找到 SKILL.md。";
  }
}

export async function buildSkillBoardModel(): Promise<SkillBoardModel> {
  const [overview, customNames] = await Promise.all([buildOverviewModel(), readCustomSkills()]);
  const customSet = new Set(customNames);
  const rows: SkillBoardRow[] = await Promise.all(
    overview.registryRows.map(async (row) => {
      const skillContent = await readSkillContent(row.skillFilePath);
      const cells = row.states.map((state) => ({
        agentId: state.agentId,
        agentName: state.agentName,
        status: state.status,
        displayStatus: DISPLAY_STATUS[state.status],
        targetPath: state.targetPath,
        detail: state.detail,
        linkTarget: state.linkTarget,
        exists: state.exists
      }));
      const missingCount = row.states.filter(
        (state) => (state.status === "missing" || state.status === "drifted") && Boolean(state.sourcePath)
      ).length;

      return {
        name: row.name,
        description: row.description,
        sourcePath: row.sourcePath || row.states.find((state) => state.sourcePath)?.sourcePath || "",
        skillFilePath: row.skillFilePath,
        skillContent,
        canSync: missingCount > 0,
        missingCount,
        cells,
        raw: row,
        isCustom: customSet.has(row.name)
      };
    })
  );

  return {
    agents: overview.agents,
    rows,
    pendingSyncCount: rows.reduce((sum, row) => sum + row.missingCount, 0)
  };
}
