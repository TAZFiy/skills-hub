import { AlertTriangle, CircleDashed, GitCompareArrows, Link2, Unplug } from "lucide-react";

import type { InstallStatus } from "@/src/types/skills";

const iconMap = {
  synced: Link2,
  missing: CircleDashed,
  drifted: GitCompareArrows,
  conflict: AlertTriangle,
  orphaned: Unplug
} satisfies Record<InstallStatus, React.ComponentType<{ size?: number }>>;

const labelMap: Record<InstallStatus, string> = {
  synced: "已同步",
  missing: "缺失",
  drifted: "已漂移",
  conflict: "冲突",
  orphaned: "孤立"
};

export function StatusPill({ status }: { status: InstallStatus }) {
  const Icon = iconMap[status];
  return (
    <span className="status-pill" data-status={status}>
      <Icon size={14} />
      {labelMap[status]}
    </span>
  );
}
