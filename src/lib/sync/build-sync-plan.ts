import type { SyncAction, SyncPlan, SyncActionType } from "@/src/types/sync";
import type { SkillInstallState } from "@/src/types/skills";

const EMPTY_SUMMARY: Record<SyncActionType, number> = {
  create_copy: 0,
  repair_copy: 0,
  skip_conflict: 0,
  remove_orphan: 0
};

export function buildSyncPlan(states: SkillInstallState[]): SyncPlan {
  const actions: SyncAction[] = [];

  for (const state of states) {
    switch (state.status) {
      case "missing":
        actions.push({
          type: "create_copy",
          skillName: state.skillName,
          agentId: state.agentId,
          agentName: state.agentName,
          sourcePath: state.sourcePath,
          targetPath: state.targetPath,
          reason: "目标目录中缺少这个技能。"
        });
        break;
      case "drifted":
        actions.push({
          type: "repair_copy",
          skillName: state.skillName,
          agentId: state.agentId,
          agentName: state.agentName,
          sourcePath: state.sourcePath,
          targetPath: state.targetPath,
          reason: "目标已存在，但内容与受管主源不一致。"
        });
        break;
      case "conflict":
        actions.push({
          type: "skip_conflict",
          skillName: state.skillName,
          agentId: state.agentId,
          agentName: state.agentName,
          sourcePath: state.sourcePath,
          targetPath: state.targetPath,
          reason: "未受管目录阻塞了自动同步。"
        });
        break;
      case "orphaned":
        actions.push({
          type: "remove_orphan",
          skillName: state.skillName,
          agentId: state.agentId,
          agentName: state.agentName,
          sourcePath: null,
          targetPath: state.targetPath,
          reason: "目标存在，但缺少受管主源。"
        });
        break;
      default:
        break;
    }
  }

  const summary = actions.reduce((acc, action) => {
    acc[action.type] += 1;
    return acc;
  }, { ...EMPTY_SUMMARY });

  return { actions, summary };
}
