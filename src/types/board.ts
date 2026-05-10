import type { AgentDefinition } from "@/src/types/agents";
import type { InstallStatus, RegistryRow } from "@/src/types/skills";

export type BoardDisplayStatus = "installed" | "missing" | "broken";

export type SkillBoardCell = {
  agentId: string;
  agentName: string;
  status: InstallStatus;
  displayStatus: BoardDisplayStatus;
  targetPath: string;
  detail: string;
  linkTarget: string | null;
  exists: boolean;
};

export type SkillBoardRow = {
  name: string;
  description: string;
  sourcePath: string;
  skillFilePath: string;
  skillContent: string;
  canSync: boolean;
  missingCount: number;
  cells: SkillBoardCell[];
  raw: RegistryRow;
  isCustom: boolean;
};

export type SkillBoardModel = {
  agents: AgentDefinition[];
  rows: SkillBoardRow[];
  pendingSyncCount: number;
};
