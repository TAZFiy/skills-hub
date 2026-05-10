"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, FileText, LoaderCircle, PanelRightOpen, PencilLine, RotateCcw, Save } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type {
  InstructionAgent,
  InstructionAsset,
  InstructionsPageModel
} from "@/src/types/instructions";

const agentLabels: Record<InstructionAgent, string> = {
  claude: "Claude",
  codex: "Codex"
};

type EditorViewMode = "edit" | "preview" | "split";

function MarkdownPreview({ content }: { content: string }) {
  return (
    <div className="markdown-preview markdown-preview-editor">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "_暂无内容_"}</ReactMarkdown>
    </div>
  );
}

export function InstructionsWorkspace() {
  const [model, setModel] = useState<InstructionsPageModel | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<InstructionAgent>("claude");
  const [editorView, setEditorView] = useState<EditorViewMode>("edit");
  const [draft, setDraft] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadInstructions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await fetch("/api/instructions", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`加载失败：${response.status}`);
      }
      const payload = (await response.json()) as InstructionsPageModel;
      setModel(payload);
      setSelectedAgent((current) =>
        payload.assets.some((asset) => asset.agent === current)
          ? current
          : payload.assets[0]?.agent ?? "claude"
      );
      return payload;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "加载失败。");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstructions();
  }, [loadInstructions]);

  const assets = model?.assets ?? [];
  const selected =
    assets.find((asset) => asset.agent === selectedAgent) ?? assets[0] ?? null;
  const baseContent = selected?.contentPreview ?? "";
  const hasUnsavedChanges = selected?.exists ? draft !== baseContent : false;
  const canSave = Boolean(selected?.exists) && hasUnsavedChanges && !isSaving;
  const canReset = selected?.exists && draft !== baseContent;

  useEffect(() => {
    setDraft(baseContent);
    setSaveError(null);
    setSaveMessage(null);
  }, [baseContent, selected?.id]);

  async function handleSave() {
    if (!selected?.exists || !canSave) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/instructions/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          path: selected.path,
          content: draft,
          previousHash: selected.contentHash
        })
      });

      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || `保存失败：${response.status}`);
      }

      await loadInstructions();
      setSaveMessage("已保存");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败。");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        void handleSave();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const fileCountLabel = isLoading ? "读取中" : `${assets.length} 个文件`;
  const previewContent = useMemo(() => draft, [draft]);

  return (
    <section className="instructions-shell instructions-editor-layout instructions-editor-app">
      <aside className="instructions-sidebar detail-card instructions-sidebar-app">
        <div className="instructions-sidebar-top">
          <div>
            <p className="eyebrow">Global Files</p>
            <h2 className="sidebar-title">{fileCountLabel}</h2>
            <p className="card-copy">当前版本只支持编辑现有的全局规则文件。</p>
          </div>
        </div>

        <div className="instructions-list-scroll instructions-list-pane">
          {loadError ? (
            <div className="empty-state empty-state-large">
              <div>
                <p className="card-title">加载失败</p>
                <p className="card-copy">{loadError}</p>
              </div>
            </div>
          ) : null}

          {!loadError
            ? assets.map((asset: InstructionAsset) => (
                <button
                  key={asset.id}
                  type="button"
                  className="instruction-row instruction-row-app"
                  data-selected={selected?.id === asset.id}
                  onClick={() => setSelectedAgent(asset.agent)}
                >
                  <div className="instruction-row-top">
                    <span className="instruction-icon">
                      <FileText size={15} />
                    </span>
                    <strong>{agentLabels[asset.agent]}</strong>
                  </div>
                  <p className="mono muted rules-list-path">{asset.path}</p>
                  <div className="instruction-row-footer">
                    <span className="instruction-row-type">
                      {asset.exists ? "可编辑" : "未找到"}
                    </span>
                    <span className="instruction-row-status">
                      {asset.exists ? "已存在" : "不可创建"}
                    </span>
                  </div>
                </button>
              ))
            : null}
        </div>
      </aside>

      <section className="instructions-editor detail-card instructions-editor-app-shell">
        <div className="instructions-editor-topbar">
          <div className="instructions-editor-heading">
            <p className="eyebrow">{selected ? agentLabels[selected.agent] : "Global Rule"}</p>
            <h2 className="detail-title">{selected?.title ?? "全局规则编辑器"}</h2>
            <p className="page-description">
              只编辑现有的 `CLAUDE.md` 与 `AGENTS.md`，不提供新建和扩展规则管理。
            </p>
          </div>

          <div className="instructions-editor-actions">
            <span className="meta-chip">
              {selected?.exists ? (hasUnsavedChanges ? "未保存" : "已同步") : "文件缺失"}
            </span>
            <button
              type="button"
              className="table-button"
              data-active={editorView === "edit"}
              onClick={() => setEditorView("edit")}
            >
              <PencilLine size={14} />
              编辑
            </button>
            <button
              type="button"
              className="table-button"
              data-active={editorView === "preview"}
              onClick={() => setEditorView("preview")}
            >
              <Eye size={14} />
              预览
            </button>
            <button
              type="button"
              className="table-button"
              data-active={editorView === "split"}
              onClick={() => setEditorView("split")}
            >
              <PanelRightOpen size={14} />
              分栏
            </button>
            <button
              type="button"
              className="table-button"
              onClick={() => {
                setDraft(baseContent);
                setSaveError(null);
                setSaveMessage(null);
              }}
              disabled={!canReset || isSaving}
            >
              <RotateCcw size={14} />
              还原
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => void handleSave()}
              disabled={!canSave}
            >
              {isSaving ? (
                <LoaderCircle size={14} className="spin" />
              ) : (
                <Save size={14} />
              )}
              {isSaving ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        <div className="instructions-editor-statusbar">
          <span className="mono instructions-editor-path">
            {selected?.path ?? "没有可编辑文件"}
          </span>
          {saveMessage ? <span className="instructions-save-ok">{saveMessage}</span> : null}
          {saveError ? <span className="board-error">{saveError}</span> : null}
        </div>

        {selected?.exists ? (
          <div className="editor-workbench editor-workbench-app" data-view={editorView}>
            {editorView !== "preview" ? (
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="editor-textarea rules-editor-textarea rules-editor-textarea-app"
                spellCheck={false}
              />
            ) : null}
            {editorView !== "edit" ? <MarkdownPreview content={previewContent} /> : null}
          </div>
        ) : (
          <div className="empty-state empty-state-large instructions-editor-empty">
            <div>
              <p className="card-title">没有可编辑文件</p>
              <p className="card-copy">
                当前机器上未找到这个全局规则文件。本版本只支持编辑现有文件，不提供创建入口。
              </p>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
