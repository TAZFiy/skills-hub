export type SyncActionType =
  | "create_copy"
  | "repair_copy"
  | "skip_conflict"
  | "remove_orphan";

export type SyncAction = {
  type: SyncActionType;
  skillName: string;
  agentId: string;
  agentName: string;
  sourcePath: string | null;
  targetPath: string;
  reason: string;
};

export type SyncPlan = {
  actions: SyncAction[];
  summary: Record<SyncActionType, number>;
};

export type SyncExecutionResult = {
  completed: SyncAction[];
  skipped: SyncAction[];
  failed: Array<SyncAction & { error: string }>;
};
