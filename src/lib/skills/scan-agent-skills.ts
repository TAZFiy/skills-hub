import { readdir } from "node:fs/promises";
import { join } from "node:path";

import {
  buildOrphanedState,
  classifyInstallState
} from "@/src/lib/skills/classify-install-state";
import { isReservedSkillEntry } from "@/src/lib/skills/is-reserved-skill-entry";
import type { AgentDefinition } from "@/src/types/agents";
import type { SkillInstallState, SkillRecord } from "@/src/types/skills";

export async function scanAgentStates(
  agent: AgentDefinition,
  skills: SkillRecord[]
): Promise<SkillInstallState[]> {
  const states = await Promise.all(
    skills.map((skill) =>
      classifyInstallState(skill, agent, join(agent.skillsPath, skill.name))
    )
  );

  const existingSkillNames = new Set(skills.map((skill) => skill.name));

  try {
    const entries = await readdir(agent.skillsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (isReservedSkillEntry(entry.name)) {
        continue;
      }

      if (existingSkillNames.has(entry.name)) {
        continue;
      }

      const targetPath = join(agent.skillsPath, entry.name);
      states.push(buildOrphanedState(entry.name, agent, targetPath));
    }
  } catch (error: unknown) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.warn(
        `[skills-hub] 无法扫描代理 "${agent.id}" 的技能目录 ${agent.skillsPath}：`,
        (error as Error).message
      );
    }
    return states;
  }

  return states.sort((left, right) => left.skillName.localeCompare(right.skillName));
}
