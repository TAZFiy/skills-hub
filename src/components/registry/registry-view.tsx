"use client";

import { useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";

import { StatusPill } from "@/src/components/ui/status-pill";
import type { AgentDefinition } from "@/src/types/agents";
import type { InstallStatus, RegistryRow } from "@/src/types/skills";

const filters: Array<InstallStatus | "all"> = [
  "all",
  "synced",
  "missing",
  "drifted",
  "conflict",
  "orphaned"
];

const filterLabels: Record<InstallStatus | "all", string> = {
  all: "全部",
  synced: "已同步",
  missing: "缺失",
  drifted: "已漂移",
  conflict: "冲突",
  orphaned: "孤立"
};

const filterDescriptions: Record<InstallStatus | "all", string> = {
  all: "",
  synced: "",
  missing: "主源里有这个技能，但当前工具的目标目录里还没有安装它。建议执行同步，把主源技能安装到这个工具目录。",
  drifted: "目标里有这个技能，但链接指错了，或者目录内容已经偏离主源。建议执行修复，让目标重新指回主源。",
  conflict: "目标目录里已经有同名内容，但它不是受管安装，系统不会自动覆盖。建议先人工比对，再决定保留现有目录还是纳入统一管理。",
  orphaned: "目标目录里存在这个技能，但主源目录里已经没有对应项，属于游离资产。建议要么迁回主源统一管理，要么从目标目录删除。"
};

function FilterHelp({
  label,
  description
}: {
  label: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="help-wrap">
      <button
        type="button"
        className="help-button"
        aria-label={`查看${label}状态说明`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp size={15} />
      </button>
      {open ? (
        <div className="help-popover" role="dialog" aria-label={`${label}状态说明`}>
          <h3 className="help-popover-title">{label}</h3>
          <p className="help-popover-copy">{description}</p>
        </div>
      ) : null}
    </div>
  );
}

export function RegistryView({
  agents,
  rows
}: {
  agents: AgentDefinition[];
  rows: RegistryRow[];
}) {
  const [activeFilter, setActiveFilter] = useState<InstallStatus | "all">("all");
  const [selected, setSelected] = useState<RegistryRow | null>(rows[0] ?? null);

  const filteredRows = useMemo(() => {
    if (activeFilter === "all") {
      return rows;
    }

    return rows.filter((row) =>
      row.states.some((state) => state.status === activeFilter)
    );
  }, [activeFilter, rows]);

  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">技能矩阵</p>
          <h2 className="card-title">左边是主源技能，右边是各工具的真实状态</h2>
        </div>
        <div className="filters">
          {filters.map((filter) => (
            <div key={filter} className="filter-group">
              <button
                type="button"
                className="filter-chip"
                data-active={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
              >
                {filterLabels[filter]}
              </button>
              {filterDescriptions[filter] ? (
                <FilterHelp
                  label={filterLabels[filter]}
                  description={filterDescriptions[filter]}
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <div className="table-scroll">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>技能</th>
              {agents.map((agent) => (
                <th key={agent.id}>{agent.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.name}
                className="matrix-row"
                onClick={() => setSelected(row)}
                style={{ cursor: "pointer" }}
              >
                <td>
                  <strong>{row.name}</strong>
                  <div className="card-copy">{row.description}</div>
                </td>
                {row.states.map((state) => (
                  <td key={`${row.name}-${state.agentId}`}>
                    <StatusPill status={state.status} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected ? (
        <div className="panel" style={{ marginTop: 16 }}>
          <p className="eyebrow">已选技能</p>
          <h3 className="card-title">{selected.name}</h3>
          <p className="card-copy">{selected.description}</p>
          <div className="detail-grid" style={{ marginTop: 16 }}>
            <div className="panel">
              <p className="eyebrow">主源</p>
              <p className="mono">{selected.sourcePath || "没有受管主源"}</p>
            </div>
            {selected.states.map((state) => (
              <div key={state.agentId} className="panel">
                <p className="eyebrow">{state.agentName}</p>
                <StatusPill status={state.status} />
                <p className="mono" style={{ marginTop: 12 }}>{state.targetPath}</p>
                {state.linkTarget ? (
                  <p className="stat-detail">link → {state.linkTarget}</p>
                ) : null}
                <p className="card-copy">{state.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
