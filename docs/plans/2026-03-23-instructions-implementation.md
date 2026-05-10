# Instructions Workspace Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a read-only `Instructions` workspace that scans and displays Claude Code and Codex instruction files inside the current project.

**Architecture:** Keep the new feature isolated from the existing skills domain. Add a dedicated instructions scanning layer on the server, map the results into a typed UI model, and render a separate page in the existing app shell. Limit the first release to project-scoped files so the product teaches the correct mental model without turning into a global config editor.

**Tech Stack:** Next.js App Router, React, TypeScript, Node `fs`/`path`, Vitest

---

### Task 1: Define the instructions domain types

**Files:**
- Create: `src/types/instructions.ts`

**Step 1: Write the failing type consumer**

Create a small compile target by referencing the future type from a server model builder:

```ts
import type { InstructionAsset } from "@/src/types/instructions";

const asset: InstructionAsset = {
  id: "claude-root",
  agent: "claude",
  kind: "main",
  scope: "project",
  path: "/tmp/CLAUDE.md",
  exists: true,
  title: "CLAUDE.md",
  description: "Project-wide instructions",
  loadBehavior: "Loaded at session start",
  priority: 10,
  parentPath: null,
  contentPreview: "# Rules"
};
```

**Step 2: Run typecheck to verify it fails**

Run: `npm run lint`
Expected: FAIL because `src/types/instructions.ts` does not exist

**Step 3: Write minimal implementation**

- define `InstructionAgent`, `InstructionKind`, `InstructionScope`
- define `InstructionAsset`
- define `InstructionSurface`
- define a small page model type if needed by the builder

**Step 4: Run typecheck to verify it passes**

Run: `npm run lint`
Expected: PASS

**Step 5: Commit**

Skip until this workspace is initialized as a git repository.

### Task 2: Build the Claude instruction scanner

**Files:**
- Create: `src/lib/instructions/scan-claude-instructions.ts`
- Create: `src/lib/instructions/scan-claude-instructions.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { scanClaudeInstructions } from "./scan-claude-instructions";

describe("scanClaudeInstructions", () => {
  it("finds root, .claude, and rules files", async () => {
    const result = await scanClaudeInstructions("/fixture/project");
    expect(result.assets.some((asset) => asset.path.endsWith("CLAUDE.md"))).toBe(true);
    expect(result.assets.some((asset) => asset.kind === "rule")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts`
Expected: FAIL because the scanner does not exist

**Step 3: Write minimal implementation**

- detect `CLAUDE.md` in project root
- detect `.claude/CLAUDE.md`
- recursively collect `.claude/rules/**/*.md`
- mark rule files with `kind: "rule"`
- add a simple conditional label if the file content starts with frontmatter containing `paths`

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 3: Build the Codex instruction scanner

**Files:**
- Create: `src/lib/instructions/scan-codex-instructions.ts`
- Create: `src/lib/instructions/scan-codex-instructions.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { scanCodexInstructions } from "./scan-codex-instructions";

describe("scanCodexInstructions", () => {
  it("returns AGENTS files along the directory chain", async () => {
    const result = await scanCodexInstructions("/fixture/repo/apps/web");
    expect(result.assets.filter((asset) => asset.kind === "main")).toHaveLength(2);
    expect(result.assets.some((asset) => asset.kind === "override")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/instructions/scan-codex-instructions.test.ts`
Expected: FAIL because the scanner does not exist

**Step 3: Write minimal implementation**

- walk from repository root to the active working directory
- collect `AGENTS.md` files in order
- collect `AGENTS.override.md` files in order
- assign increasing priority by specificity
- include a short load behavior string suitable for UI display

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/instructions/scan-codex-instructions.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 4: Build the server-side instructions page model

**Files:**
- Create: `src/lib/server/build-instructions-model.ts`

**Step 1: Write the failing builder usage**

Create a page-level call site:

```ts
const model = await buildInstructionsModel();
console.log(model.surfaces.length);
```

**Step 2: Run typecheck to verify it fails**

Run: `npm run lint`
Expected: FAIL because the builder does not exist

**Step 3: Write minimal implementation**

- call both scanners in parallel
- build one surface for Claude and one for Codex
- compute summary counts
- sort assets by priority, then path
- keep the output read-only and UI-focused

**Step 4: Run typecheck to verify it passes**

Run: `npm run lint`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 5: Add the Instructions page route

**Files:**
- Create: `app/instructions/page.tsx`

**Step 1: Write the failing page contract**

Target the first render contract:

```tsx
// app/instructions/page.tsx should render the title "Instructions"
```

**Step 2: Run app verification to verify it fails**

Run: `npm run lint`
Expected: FAIL because the route does not exist

**Step 3: Write minimal implementation**

- load the instructions model on the server
- render a `PageHeader`
- pass the model to a dedicated client component or server-rendered workspace component

**Step 4: Run app verification to verify it passes**

Run: `npm run lint`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 6: Build the Instructions workspace UI

**Files:**
- Create: `src/components/instructions/instructions-workspace.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing render target**

Define the UI contract:

```tsx
// workspace shows filters, asset list, and detail panel
```

**Step 2: Run app verification to verify it fails**

Run: `npm run lint`
Expected: FAIL because the component does not exist

**Step 3: Write minimal implementation**

- add agent and kind filters
- render one selectable list row per instruction asset
- show absolute path, explanation, load behavior, and content preview in the detail panel
- visually distinguish Claude rule files and Codex override files
- reuse the current design language rather than introducing a new visual system

**Step 4: Run app verification to verify it passes**

Run: `npm run lint`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 7: Add navigation entry and metadata updates

**Files:**
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/sidebar-nav.tsx`
- Modify: `app/layout.tsx`

**Step 1: Write the failing navigation expectation**

Define the contract:

```tsx
// sidebar should include an Instructions item that routes to /instructions
```

**Step 2: Run app verification to verify it fails**

Run: `npm run lint`
Expected: FAIL because navigation does not know about the new route

**Step 3: Write minimal implementation**

- add a sidebar item for `/instructions`
- choose an icon consistent with the current nav
- update metadata copy if needed so the site description covers skills and instruction files

**Step 4: Run app verification to verify it passes**

Run: `npm run lint`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 8: Add scanner fixtures and regression tests

**Files:**
- Create: `tests/fixtures/instructions/claude-project/...`
- Create: `tests/fixtures/instructions/codex-project/...`
- Modify: `src/lib/instructions/scan-claude-instructions.test.ts`
- Modify: `src/lib/instructions/scan-codex-instructions.test.ts`

**Step 1: Write the failing fixture-based assertions**

```ts
expect(result.summary.ruleFiles).toBe(2);
expect(result.assets[0].priority).toBeLessThan(result.assets.at(-1)!.priority);
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: FAIL until fixture coverage matches the new implementation

**Step 3: Write minimal implementation**

- create deterministic fixture trees for both agents
- cover missing recommended files where appropriate
- verify conditional rule labeling for Claude
- verify precedence ordering for Codex

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 9: Run final verification

**Files:**
- Modify: none unless fixes are required

**Step 1: Run targeted tests**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: PASS

**Step 2: Run app validation**

Run: `npm run lint`
Expected: PASS

**Step 3: Manual verification**

Run: `npm run dev`
Expected:

- `/instructions` loads without runtime errors
- Claude assets are listed separately from Codex assets
- selecting an asset updates the detail panel
- the page makes clear that settings and memory are not part of this release

**Step 4: Capture follow-up issues**

- note if user-level files should be added next
- note if settings and auto memory deserve a second workspace

**Step 5: Commit**

Skip until git is available.
