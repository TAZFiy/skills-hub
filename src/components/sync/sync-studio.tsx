"use client";

import { useState, useTransition } from "react";

import type { SyncExecutionResult, SyncPlan } from "@/src/types/sync";

const labels = {
  create_link: "待创建链接",
  repair_link: "待修复链接",
  skip_conflict: "待检查冲突",
  remove_orphan: "孤立目标"
} as const;

export function SyncStudio({ initialPlan }: { initialPlan: SyncPlan }) {
  const [result, setResult] = useState<SyncExecutionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pruneOrphans, setPruneOrphans] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleApplySync() {
    setErrorMessage(null);

    try {
      const response = await fetch("/api/sync/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pruneOrphans })
      });

      if (!response.ok) {
        throw new Error(`同步失败：${response.status}`);
      }

      const payload = (await response.json()) as SyncExecutionResult;
      startTransition(() => {
        setResult(payload);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "同步时出现未知错误。");
    }
  }

  const grouped = Object.entries(labels).map(([type, label]) => ({
    type,
    label,
    items: initialPlan.actions.filter((action) => action.type === type)
  }));

  return (
    <section className="page-stack">
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">预览</p>
            <h2 className="card-title">不做静默覆盖</h2>
          </div>
          <label className="filter-chip" data-active={pruneOrphans}>
            <input
              type="checkbox"
              checked={pruneOrphans}
              onChange={(event) => setPruneOrphans(event.target.checked)}
            />
            清理孤立目标
          </label>
        </div>
        <div className="sync-columns">
          {grouped.map((group) => (
            <div key={group.type} className="matrix-card">
              <p className="eyebrow">{group.label}</p>
              <div className="stat-value" style={{ fontSize: "2rem", marginTop: 4 }}>
                {group.items.length}
              </div>
              <div className="list" style={{ marginTop: 12 }}>
                {group.items.slice(0, 8).map((item) => (
                  <div className="list-item" key={`${item.agentId}-${item.skillName}-${item.type}`}>
                    <div>
                    <strong>{item.skillName}</strong>
                    <p className="card-copy">
                      {item.agentName} · {item.reason}
                    </p>
                    </div>
                  </div>
                ))}
                {group.items.length === 0 ? (
                  <p className="card-copy">这一组没有项目。</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">执行</p>
            <h2 className="card-title">应用这些受管动作</h2>
          </div>
          <button
            type="button"
            className="action-link"
            onClick={handleApplySync}
            disabled={isPending}
          >
            {isPending ? "同步中..." : "执行同步"}
          </button>
        </div>
        {result ? (
          <div className="sync-columns">
            <div className="result-block">
              <p className="eyebrow">已完成</p>
              {result.completed.map((item) => (
                <div key={`${item.agentId}-${item.skillName}-${item.type}`} className="list-item">
                  <div>
                    <strong>{item.skillName}</strong>
                    <p className="card-copy">{item.agentName}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="result-block">
              <p className="eyebrow">已跳过 / 失败</p>
              {result.skipped.map((item) => (
                <div key={`${item.agentId}-${item.skillName}-${item.type}`} className="list-item">
                  <div>
                    <strong>{item.skillName}</strong>
                    <p className="card-copy">{item.reason}</p>
                  </div>
                </div>
              ))}
              {result.failed.map((item) => (
                <div key={`${item.agentId}-${item.skillName}-${item.type}`} className="list-item">
                  <div>
                    <strong>{item.skillName}</strong>
                    <p className="card-copy">{item.error}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="card-copy">
            必须先预览再执行。冲突项默认保持非破坏性处理。
          </p>
        )}
        {errorMessage ? <p className="card-copy" style={{ color: "var(--danger)" }}>{errorMessage}</p> : null}
      </div>
    </section>
  );
}
