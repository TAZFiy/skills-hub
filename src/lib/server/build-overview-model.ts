import { join } from "node:path";

import { loadAgents } from "@/src/lib/config/load-agents";
import { scanAgentStates } from "@/src/lib/skills/scan-agent-skills";
import { scanAllSkills } from "@/src/lib/skills/scan-all-skills";
import { summarizeStates } from "@/src/lib/skills/classify-install-state";
import { buildSyncPlan } from "@/src/lib/sync/build-sync-plan";
import type { AgentDefinition } from "@/src/types/agents";
import type { RegistryRow, SkillInstallState, SkillRecord } from "@/src/types/skills";

export type OverviewModel = {
  agents: AgentDefinition[];
  skills: SkillRecord[];
  registryRows: RegistryRow[];
  agentStates: Record<string, SkillInstallState[]>;
  allStates: SkillInstallState[];
  stateSummary: ReturnType<typeof summarizeStates>;
  syncPlan: ReturnType<typeof buildSyncPlan>;
};

export async function buildOverviewModel(): Promise<OverviewModel> {
  const agents = await loadAgents();
  const skills = await scanAllSkills(agents);

  const entries = await Promise.all(
    agents.map(async (agent) => [agent.id, await scanAgentStates(agent, skills)] as const)
  );
  const agentStates = Object.fromEntries(entries);
  const allStates = Object.values(agentStates).flat();
  const stateSummary = summarizeStates(allStates);
  const syncPlan = buildSyncPlan(allStates);

  const makeMissingState = (
    agent: AgentDefinition,
    skillName: string,
    sourcePath: string | null
  ): SkillInstallState => ({
    skillName,
    agentId: agent.id,
    agentName: agent.name,
    status: "missing",
    sourcePath,
    targetPath: join(agent.skillsPath, skillName),
    exists: false,
    isSymlink: false,
    linkTarget: null,
    isManaged: false,
    detail: "目标目录中尚未安装。"
  });

  const registryRows: RegistryRow[] = skills
    .map((skill) => ({
      ...skill,
      states: agents.map((agent) => {
        const state = agentStates[agent.id].find(
          (item) => item.skillName === skill.name && item.status !== "orphaned"
        );
        return state ?? makeMissingState(agent, skill.name, skill.sourcePath);
      })
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return {
    agents,
    skills,
    registryRows,
    agentStates,
    allStates,
    stateSummary,
    syncPlan
  };
}
