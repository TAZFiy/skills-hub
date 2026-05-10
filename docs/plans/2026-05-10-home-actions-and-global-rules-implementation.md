# 首页操作与全局规则收敛 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让首页直接承载高频管理操作，并把规则页收敛为仅编辑 `CLAUDE.md` 与 `AGENTS.md` 的极简工作区。

**Architecture:** 复用现有 Next.js 页面与 API 结构，在前端收敛信息架构、前移操作按钮，并在规则扫描 / 更新层同步收紧允许范围，避免 UI 与后端能力不一致。

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Tailwind-style global CSS

---

### Task 1: 记录任务与设计基线

**Files:**
- Modify: `tasks/todo.md`
- Create: `docs/plans/2026-05-10-home-actions-and-global-rules-design.md`
- Create: `docs/plans/2026-05-10-home-actions-and-global-rules-implementation.md`

**Step 1: 更新 spec / tasks / verify**

把首页高频操作前移、规则页只编辑双文件、loading 反馈统一化写入任务清单。

**Step 2: 保存设计文档**

记录为什么要把详情操作前移，以及为什么要同步收紧规则 allowlist。

**Step 3: 保存实现计划**

把首页、规则页、样式、测试拆成独立任务，避免边改边漂。

### Task 2: 首页列表操作前移并补 loading

**Files:**
- Modify: `src/components/board/skills-board.tsx`
- Modify: `app/globals.css`

**Step 1: 给列表行增加直接操作**

把“标记自制 / 删除”移动到列表行操作区，详情里不再承载这些高频操作。

**Step 2: 增加逐项 pending 状态**

为单项同步、批量同步、删除、自制标记维护明确的 pending key，并在按钮上显示处理中状态。

**Step 3: 收敛详情面板职责**

详情只保留说明、安装目标和 `SKILL.md` 内容查看。

### Task 3: 规则页收敛为双文件编辑器

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`
- Modify: `app/instructions/page.tsx`
- Modify: `app/globals.css`

**Step 1: 删除创建与筛选工作流**

移除新建、分类、kind 切换与相关状态，只保留两个文件的切换。

**Step 2: 保留核心编辑动作**

保留编辑 / 预览 / 分栏 / 保存 / 重置，并补保存中的 loading。

**Step 3: 处理缺失文件状态**

当目标文件不存在时，显示不可编辑提示，并禁用保存。

### Task 4: 收紧规则扫描与更新边界

**Files:**
- Modify: `src/lib/instructions/scan-claude-instructions.ts`
- Modify: `src/lib/instructions/scan-codex-instructions.ts`
- Modify: `src/lib/instructions/save-instruction-asset.ts`
- Modify: `app/api/instructions/create/route.ts`

**Step 1: 扫描层只返回主文件**

Claude 仅返回 `CLAUDE.md`，Codex 仅返回 `AGENTS.md`。

**Step 2: 更新层只允许双文件**

禁止更新 Claude `rules/*` 和 `AGENTS.override.md`。

**Step 3: 关闭创建入口**

移除或停用创建路由，避免产品行为与目标不一致。

### Task 5: 更新测试与验证

**Files:**
- Modify: `src/lib/instructions/scan-claude-instructions.test.ts`
- Modify: `src/lib/instructions/scan-codex-instructions.test.ts`
- Modify: `src/lib/instructions/save-instruction-asset.test.ts`
- Modify: `tasks/todo.md`
- Modify: `tasks/lessons.md`

**Step 1: 调整扫描测试**

把预期更新为只扫描两个主文件。

**Step 2: 调整保存边界测试**

验证主文件仍可更新，旧的规则文件与 override 文件不再允许。

**Step 3: 运行验证**

Run: `npx tsc --noEmit`
Expected: PASS

Run: `npm test`
Expected: PASS

**Step 4: 回填 review / lessons**

把验证结果和本轮经验写回任务文档。
