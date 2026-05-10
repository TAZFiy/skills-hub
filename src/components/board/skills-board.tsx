"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Code2, HardDriveDownload, LoaderCircle, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import type { SkillBoardModel } from "@/src/types/board";

const displayStatusLabel = {
  installed: "已安装",
  missing: "缺失",
  broken: "异常"
} as const;

export function SkillsBoard({ model }: { model: SkillBoardModel }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "needs_sync" | "broken" | "external">("all");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return model.rows.filter((row) => {
      if (mode === "needs_sync" && !row.canSync) {
        return false;
      }
      if (
        mode === "broken" &&
        !row.cells.some((cell) => cell.displayStatus === "broken")
      ) {
        return false;
      }
      if (
        mode === "external" &&
        !row.cells.some((cell) => cell.status === "orphaned")
      ) {
        return false;
      }
      if (!normalized) {
        return true;
      }
      const haystack = `${row.name} ${row.description}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [mode, model.rows, query]);

  const activeRow = rows.find((row) => row.name === selectedName) ?? null;
  const syncableSelectedNames = rows
    .filter((row) => selectedNames.includes(row.name) && row.canSync)
    .map((row) => row.name);
  const counts = useMemo(
    () => ({
      all: model.rows.length,
      needsSync: model.rows.filter((row) => row.canSync).length,
      broken: model.rows.filter((row) =>
        row.cells.some((cell) => cell.displayStatus === "broken")
      ).length,
      external: model.rows.filter((row) =>
        row.cells.some((cell) => cell.status === "orphaned")
      ).length
    }),
    [model.rows]
  );

  useEffect(() => {
    setSelectedNames((current) => current.filter((name) => rows.some((row) => row.name === name)));
  }, [rows]);

  useEffect(() => {
    if (selectedName && !rows.some((row) => row.name === selectedName)) {
      setSelectedName(null);
    }
  }, [rows, selectedName]);

  const uiLocked = isPending || busyAction !== null;

  function isActionBusy(actionKey: string) {
    return busyAction === actionKey;
  }

  function refreshBoard() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function runSync(body: Record<string, unknown>, actionKey: string) {
    setSyncError(null);
    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/sync/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`同步失败：${response.status}`);
      }

      refreshBoard();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "同步失败。");
    } finally {
      setBusyAction(null);
    }
  }

  async function deleteSkill(skillName: string) {
    setSyncError(null);
    if (!confirm(`确定要删除技能 "${skillName}" 吗？这将清除所有 agent 下的拷贝。`)) return;
    setBusyAction(`delete:${skillName}`);
    try {
      const response = await fetch("/api/sync/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `删除失败：${response.status}`);
      }
      setSelectedName(null);
      refreshBoard();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "删除失败。");
    } finally {
      setBusyAction(null);
    }
  }

  async function toggleCustomTag(skillName: string, isCustom: boolean) {
    setSyncError(null);
    setBusyAction(`${isCustom ? "untag" : "tag"}:${skillName}`);
    try {
      const response = await fetch("/api/custom-tag", {
        method: isCustom ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skillName })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `更新失败：${response.status}`);
      }
      refreshBoard();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "更新失败。");
    } finally {
      setBusyAction(null);
    }
  }

  async function runBatchSync(names: string[]) {
    if (names.length === 0) {
      return;
    }

    setSyncError(null);
    setBusyAction("batch-sync");

    try {
      for (const skillName of names) {
        const response = await fetch("/api/sync/apply", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ skillName, types: ["create_copy", "repair_copy"] })
        });

        if (!response.ok) {
          throw new Error(`同步失败：${response.status}`);
        }
      }

      setSelectedNames([]);
      refreshBoard();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "同步失败。");
    } finally {
      setBusyAction(null);
    }
  }

  function toggleSelection(name: string) {
    setSelectedNames((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name]
    );
  }

  function toggleVisibleSelection() {
    const visibleNames = rows.map((row) => row.name);
    const allVisibleSelected = visibleNames.every((name) => selectedNames.includes(name));
    setSelectedNames((current) =>
      allVisibleSelected
        ? current.filter((name) => !visibleNames.includes(name))
        : Array.from(new Set([...current, ...visibleNames]))
    );
  }

  const allVisibleSelected =
    rows.length > 0 && rows.every((row) => selectedNames.includes(row.name));

  return (
    <section className="board-shell board-shell-grid">
      <div className="workspace-toolbar workspace-toolbar-main">
        <div className="workspace-toolbar-copy">
          <p className="eyebrow">Resource List</p>
          <h2 className="sidebar-title">{rows.length} 个条目</h2>
          <p className="toolbar-meta">
            {model.rows.length} 个技能 · {model.agents.length} 个工具 · {model.pendingSyncCount} 个缺失项
          </p>
        </div>
        <div className="workspace-toolbar-actions">
          <div className="inline-filter-group" aria-label="资源范围">
            <button
              type="button"
              className="inline-filter"
              data-active={mode === "all"}
              onClick={() => setMode("all")}
            >
              全部
              <strong>{counts.all}</strong>
            </button>
            <button
              type="button"
              className="inline-filter"
              data-active={mode === "needs_sync"}
              onClick={() => setMode("needs_sync")}
            >
              待同步
              <strong>{counts.needsSync}</strong>
            </button>
            <button
              type="button"
              className="inline-filter"
              data-active={mode === "broken"}
              onClick={() => setMode("broken")}
            >
              异常
              <strong>{counts.broken}</strong>
            </button>
            <button
              type="button"
              className="inline-filter"
              data-active={mode === "external"}
              onClick={() => setMode("external")}
            >
              外部
              <strong>{counts.external}</strong>
            </button>
          </div>
          <label className="search-shell search-shell-solid">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索技能、描述或异常项"
              className="search-input"
            />
          </label>
          <button
            type="button"
            className="table-button"
            onClick={toggleVisibleSelection}
            disabled={uiLocked || rows.length === 0}
          >
            {allVisibleSelected ? "取消全选" : "全选当前列表"}
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              syncableSelectedNames.length > 0
                ? runBatchSync(syncableSelectedNames)
                : runSync({ skillName: null, types: ["create_copy", "repair_copy"] }, "sync-all")
            }
            disabled={
              uiLocked ||
              (syncableSelectedNames.length === 0 && model.pendingSyncCount === 0)
            }
          >
            {(isActionBusy("batch-sync") || isActionBusy("sync-all")) ? (
              <LoaderCircle size={16} className="spin" />
            ) : (
              <HardDriveDownload size={16} />
            )}
            {isActionBusy("batch-sync") || isActionBusy("sync-all")
              ? "同步中..."
              : syncableSelectedNames.length > 0
                ? `同步选中 ${syncableSelectedNames.length} 项`
                : "同步全部缺失"}
          </button>
        </div>
      </div>

      {syncError ? <p className="card-copy board-error">{syncError}</p> : null}

      <section className="table-panel board-list-panel">
        <div className="sidebar-head">
          <div>
            <p className="eyebrow">技能列表</p>
            <h2 className="sidebar-title">紧凑视图</h2>
          </div>
          <div className="table-summary">
            <span className="meta-chip">已选 {selectedNames.length} 项</span>
            <span className="meta-chip">工具数 {model.agents.length}</span>
          </div>
        </div>

        <div className="table-scroll board-table-scroll">
          <table className="skills-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input
                    aria-label="选择当前列表"
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleVisibleSelection}
                  />
                </th>
                <th>技能</th>
                {model.agents.map((agent) => (
                  <th key={agent.id}>{agent.name}</th>
                ))}
                <th>缺口</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.name}
                  data-selected={activeRow?.name === row.name}
                  onClick={() => setSelectedName(row.name)}
                >
                  <td className="checkbox-column" onClick={(event) => event.stopPropagation()}>
                    <input
                      aria-label={`选择 ${row.name}`}
                      type="checkbox"
                      checked={selectedNames.includes(row.name)}
                      onChange={() => toggleSelection(row.name)}
                    />
                  </td>
                  <td>
                    <div className="table-skill-name">
                      {row.name}
                      {row.isCustom && (
                        <span className="origin-badge origin-badge-custom">自制</span>
                      )}
                    </div>
                    <div className="table-skill-copy" title={row.description}>
                      {row.description}
                    </div>
                  </td>
                  {row.cells.map((cell) => (
                    <td key={`${row.name}-${cell.agentId}`}>
                      <span className="board-status" data-status={cell.displayStatus}>
                        {displayStatusLabel[cell.displayStatus]}
                      </span>
                    </td>
                  ))}
                  <td>
                    <span className="muted">
                      {row.canSync ? `${row.missingCount} 个` : "0"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="table-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void runSync(
                            { skillName: row.name, types: ["create_copy", "repair_copy"] },
                            `sync:${row.name}`
                          );
                        }}
                        disabled={uiLocked || !row.canSync}
                      >
                        {isActionBusy(`sync:${row.name}`) ? (
                          <>
                            <LoaderCircle size={14} className="spin" />
                            同步中
                          </>
                        ) : (
                          "同步"
                        )}
                      </button>
                      <button
                        type="button"
                        className={row.isCustom ? "table-button table-button-custom-active" : "table-button"}
                        onClick={(event) => {
                          event.stopPropagation();
                          void toggleCustomTag(row.name, row.isCustom);
                        }}
                        disabled={uiLocked}
                      >
                        {isActionBusy(`${row.isCustom ? "untag" : "tag"}:${row.name}`) ? (
                          <>
                            <LoaderCircle size={14} className="spin" />
                            处理中
                          </>
                        ) : row.isCustom ? (
                          "取消自制"
                        ) : (
                          "标记自制"
                        )}
                      </button>
                      {row.cells.some((cell) => cell.exists) ? (
                        <button
                          type="button"
                          className="table-button table-button-danger"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteSkill(row.name);
                          }}
                          disabled={uiLocked}
                        >
                          {isActionBusy(`delete:${row.name}`) ? (
                            <>
                              <LoaderCircle size={14} className="spin" />
                              删除中
                            </>
                          ) : (
                            "删除"
                          )}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="table-button table-button-ghost"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedName(row.name);
                        }}
                        disabled={uiLocked}
                      >
                        详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="empty-state">
              <p className="card-title">没有匹配结果</p>
              <p className="card-copy">换个关键词，或者切回“全部”。</p>
            </div>
          ) : null}
        </div>
      </section>

      {activeRow ? (
        <div className="detail-overlay" onClick={() => setSelectedName(null)}>
          <section
            className="workspace-detail detail-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-hero">
              <div>
                <div className="detail-hero-top">
                  <h2 className="detail-title">
                    {activeRow.name}
                    {activeRow.isCustom && (
                      <span className="origin-badge origin-badge-custom">自制</span>
                    )}
                  </h2>
                  <span className="meta-chip">
                    {activeRow.canSync ? `${activeRow.missingCount} 个缺口` : "已齐全"}
                  </span>
                </div>
                <p className="page-description detail-description">{activeRow.description}</p>
              </div>
              <div className="detail-hero-actions">
                <button
                  type="button"
                  className="table-button table-button-ghost"
                  onClick={() => setSelectedName(null)}
                  disabled={uiLocked}
                >
                  关闭
                </button>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    runSync(
                      { skillName: activeRow.name, types: ["create_copy", "repair_copy"] },
                      `sync:${activeRow.name}`
                    )
                  }
                  disabled={uiLocked || !activeRow.canSync}
                >
                  {isActionBusy(`sync:${activeRow.name}`) ? (
                    <LoaderCircle size={16} className="spin" />
                  ) : (
                    <HardDriveDownload size={16} />
                  )}
                  {isActionBusy(`sync:${activeRow.name}`) ? "同步中..." : "同步"}
                </button>
              </div>
            </div>

            <div className="detail-card">
              <p className="eyebrow">Source</p>
              <div className="path-row">
                <Code2 size={16} />
                <span className="mono">{activeRow.skillFilePath}</span>
              </div>
            </div>

            <div className="detail-card">
              <p className="eyebrow">Targets</p>
              <div className="install-grid install-grid-single">
                {activeRow.cells.map((cell) => (
                  <div key={cell.agentId} className="install-card">
                    <div className="install-card-top">
                      <strong>{cell.agentName}</strong>
                      <span className="board-status" data-status={cell.displayStatus}>
                        {displayStatusLabel[cell.displayStatus]}
                      </span>
                    </div>
                    <p className="mono muted">{cell.targetPath}</p>
                    <p className="card-copy">{cell.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-card">
              <p className="eyebrow">SKILL.md</p>
              <div className="code-view code-view-flat code-view-compact">
                <pre className="code-block">
                  <code>{activeRow.skillContent}</code>
                </pre>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
