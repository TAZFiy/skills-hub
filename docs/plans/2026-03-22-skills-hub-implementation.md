# Skills Hub Local Web Console Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a local web console that scans `/Users/liuxingqi/.agents/skills`, compares install state across agent skill directories, previews sync actions, and applies safe symlink-based synchronization.

**Architecture:** Create a local Next.js application with a server-side filesystem layer. Keep v1 database-free by deriving state from filesystem scans and a small local config file, then expose scan and sync actions through typed API routes consumed by a registry-first UI.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Node `fs`/`path`, Vitest, React Testing Library, Playwright

---

### Task 1: Scaffold the local app shell

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.js`
- Create: `tailwind.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `public/.gitkeep`

**Step 1: Write the failing setup check**

Create a minimal smoke test target by deciding the first render contract:

```tsx
// app/page.tsx should eventually render "Skills Hub"
```

**Step 2: Run setup validation**

Run: `npm install`
Expected: dependencies install successfully and `next` is available

**Step 3: Write minimal implementation**

- initialize a Next.js app structure manually
- add Tailwind configuration
- create a root layout
- render a placeholder homepage with `Skills Hub`

**Step 4: Run app verification**

Run: `npm run lint`
Expected: no config or syntax errors

**Step 5: Commit**

This workspace is not a git repository. Skip commit until the project is initialized in git.

### Task 2: Add local configuration for managed agents

**Files:**
- Create: `config/agents.json`
- Create: `src/types/agents.ts`
- Create: `src/lib/config/load-agents.ts`
- Test: `src/lib/config/load-agents.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { loadAgents } from "./load-agents";

describe("loadAgents", () => {
  it("loads enabled agent path definitions", async () => {
    const agents = await loadAgents();
    expect(agents.some((agent) => agent.id === "claude")).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/config/load-agents.test.ts`
Expected: FAIL because loader and config do not exist yet

**Step 3: Write minimal implementation**

- define the `AgentDefinition` type
- create `config/agents.json` with initial agent paths
- implement `loadAgents()` to parse and validate the file

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/config/load-agents.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 3: Build the filesystem scanner for source skills

**Files:**
- Create: `src/types/skills.ts`
- Create: `src/lib/skills/read-skill-frontmatter.ts`
- Create: `src/lib/skills/scan-source-skills.ts`
- Test: `src/lib/skills/scan-source-skills.test.ts`
- Create: `tests/fixtures/source-skills/.gitkeep`

**Step 1: Write the failing test**

```ts
it("returns skills from the source directory", async () => {
  const skills = await scanSourceSkills(fixturePath);
  expect(skills.map((skill) => skill.name)).toContain("frontend-design");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/skills/scan-source-skills.test.ts`
Expected: FAIL because scanner does not exist

**Step 3: Write minimal implementation**

- scan one directory level for skill folders
- require `SKILL.md`
- parse YAML frontmatter for `name` and `description`
- return normalized skill records

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/skills/scan-source-skills.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 4: Build target scanner and state classification

**Files:**
- Create: `src/types/state.ts`
- Create: `src/lib/skills/scan-agent-skills.ts`
- Create: `src/lib/skills/classify-install-state.ts`
- Test: `src/lib/skills/classify-install-state.test.ts`

**Step 1: Write the failing test**

```ts
it("classifies a correct symlink as synced", async () => {
  const state = await classifyInstallState({
    skillName: "frontend-design",
    sourcePath: "/source/frontend-design",
    targetPath: "/target/frontend-design",
  });
  expect(state.status).toBe("synced");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/skills/classify-install-state.test.ts`
Expected: FAIL because classifier does not exist

**Step 3: Write minimal implementation**

- scan target directories
- detect symlink versus directory
- resolve link targets
- classify `synced`, `missing`, `drifted`, `conflict`, `orphaned`

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/skills/classify-install-state.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 5: Build the sync planning engine

**Files:**
- Create: `src/lib/sync/build-sync-plan.ts`
- Create: `src/types/sync.ts`
- Test: `src/lib/sync/build-sync-plan.test.ts`

**Step 1: Write the failing test**

```ts
it("creates repair actions for drifted links", () => {
  const plan = buildSyncPlan([
    { skillName: "frontend-design", agentId: "codex", status: "drifted" }
  ]);
  expect(plan.actions[0].type).toBe("repair_link");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sync/build-sync-plan.test.ts`
Expected: FAIL because planner does not exist

**Step 3: Write minimal implementation**

- convert classified states into sync actions
- group actions by type
- skip unmanaged conflicts
- expose counts for summary cards

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sync/build-sync-plan.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 6: Build the sync executor

**Files:**
- Create: `src/lib/sync/apply-sync-plan.ts`
- Test: `src/lib/sync/apply-sync-plan.test.ts`

**Step 1: Write the failing test**

```ts
it("creates a symlink for missing skills", async () => {
  const result = await applySyncPlan(plan, { dryRun: false });
  expect(result.completed[0].type).toBe("create_link");
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/sync/apply-sync-plan.test.ts`
Expected: FAIL because executor does not exist

**Step 3: Write minimal implementation**

- create target directories if missing
- create symlinks for `create_link`
- remove and recreate broken symlinks for `repair_link`
- leave conflicts untouched
- return structured results for the UI

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/sync/apply-sync-plan.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 7: Expose scan and sync APIs

**Files:**
- Create: `app/api/overview/route.ts`
- Create: `app/api/registry/route.ts`
- Create: `app/api/sync/preview/route.ts`
- Create: `app/api/sync/apply/route.ts`
- Create: `src/lib/server/build-overview-model.ts`
- Test: `app/api/overview/route.test.ts`

**Step 1: Write the failing test**

```ts
it("returns overview metrics", async () => {
  const response = await GET();
  expect(response.status).toBe(200);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/overview/route.test.ts`
Expected: FAIL because route does not exist

**Step 3: Write minimal implementation**

- compose scan, classification, and sync-plan summaries
- return typed JSON for overview, registry, preview, and apply endpoints

**Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/overview/route.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 8: Build the design system and app chrome

**Files:**
- Modify: `app/globals.css`
- Create: `src/components/app-shell.tsx`
- Create: `src/components/sidebar-nav.tsx`
- Create: `src/components/topbar.tsx`
- Create: `src/components/ui/status-pill.tsx`
- Create: `src/components/ui/stat-card.tsx`

**Step 1: Write the failing render test**

```tsx
it("renders the main navigation", () => {
  render(<AppShell><div>body</div></AppShell>);
  expect(screen.getByText("Overview")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/app-shell.test.tsx`
Expected: FAIL because shell components do not exist

**Step 3: Write minimal implementation**

- define CSS variables for the editorial-industrial theme
- add navigation shell and topbar
- implement accessible status pills and summary cards

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/app-shell.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 9: Build the Overview page

**Files:**
- Modify: `app/page.tsx`
- Create: `src/components/overview/system-snapshot.tsx`
- Create: `src/components/overview/agent-constellation.tsx`
- Create: `src/components/overview/recent-drift-list.tsx`
- Test: `app/page.test.tsx`

**Step 1: Write the failing page test**

```tsx
it("renders overview metrics and agent cards", async () => {
  render(await HomePage());
  expect(screen.getByText("System Snapshot")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/page.test.tsx`
Expected: FAIL because overview UI is not implemented

**Step 3: Write minimal implementation**

- fetch overview data on the server
- render metrics, agent cards, and drift list
- wire up rescan and preview sync entry points

**Step 4: Run test to verify it passes**

Run: `npx vitest run app/page.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 10: Build the Registry matrix page

**Files:**
- Create: `app/registry/page.tsx`
- Create: `src/components/registry/skill-matrix.tsx`
- Create: `src/components/registry/skill-row.tsx`
- Create: `src/components/registry/skill-detail-drawer.tsx`
- Test: `app/registry/page.test.tsx`

**Step 1: Write the failing page test**

```tsx
it("renders skills across agent columns", async () => {
  render(await RegistryPage());
  expect(screen.getByText("Claude")).toBeInTheDocument();
  expect(screen.getByText("Codex")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/registry/page.test.tsx`
Expected: FAIL because registry page does not exist

**Step 3: Write minimal implementation**

- render a sticky first column for skill metadata
- render per-agent state cells
- add filtering by state
- add right-side detail drawer for selected skill

**Step 4: Run test to verify it passes**

Run: `npx vitest run app/registry/page.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 11: Build the Agents page

**Files:**
- Create: `app/agents/page.tsx`
- Create: `src/components/agents/agent-card-grid.tsx`
- Create: `src/components/agents/agent-card.tsx`
- Test: `app/agents/page.test.tsx`

**Step 1: Write the failing page test**

```tsx
it("renders configured agents and their paths", async () => {
  render(await AgentsPage());
  expect(screen.getByText("Claude Code")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/agents/page.test.tsx`
Expected: FAIL because agents page does not exist

**Step 3: Write minimal implementation**

- render one card per agent
- show counts, path, and state breakdown
- link from each card into filtered registry and sync views

**Step 4: Run test to verify it passes**

Run: `npx vitest run app/agents/page.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 12: Build Sync Studio

**Files:**
- Create: `app/sync/page.tsx`
- Create: `src/components/sync/sync-summary.tsx`
- Create: `src/components/sync/sync-action-list.tsx`
- Create: `src/components/sync/apply-sync-button.tsx`
- Test: `app/sync/page.test.tsx`

**Step 1: Write the failing page test**

```tsx
it("renders grouped sync actions", async () => {
  render(await SyncPage());
  expect(screen.getByText("Links to Create")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run app/sync/page.test.tsx`
Expected: FAIL because sync page does not exist

**Step 3: Write minimal implementation**

- fetch preview plan
- show grouped actions and counts
- allow apply
- show success, skipped, and failed results

**Step 4: Run test to verify it passes**

Run: `npx vitest run app/sync/page.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 13: Add accessibility, loading, and error states

**Files:**
- Modify: `src/components/**/*`
- Modify: `app/**/*`
- Create: `app/loading.tsx`
- Create: `app/error.tsx`
- Test: `src/components/accessibility.test.tsx`

**Step 1: Write the failing test**

```tsx
it("shows visible text labels for all status pills", () => {
  render(<StatusPill status="synced" />);
  expect(screen.getByText("synced")).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/accessibility.test.tsx`
Expected: FAIL if labels, focus states, or loading fallbacks are incomplete

**Step 3: Write minimal implementation**

- add loading state pages
- add error boundary UI
- ensure focus visibility
- ensure icon-only buttons have labels
- respect reduced motion

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/accessibility.test.tsx`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 14: Add end-to-end verification

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/overview.spec.ts`
- Create: `tests/e2e/registry.spec.ts`
- Create: `tests/e2e/sync.spec.ts`

**Step 1: Write the failing e2e spec**

```ts
test("user can preview sync actions", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Sync Studio" }).click();
  await expect(page.getByText("Links to Create")).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/sync.spec.ts`
Expected: FAIL until the UI and routes are wired

**Step 3: Write minimal implementation**

- configure Playwright for local dev server
- mock or fixture filesystem data where needed
- verify overview, registry, and sync flows

**Step 4: Run test to verify it passes**

Run: `npx playwright test`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 15: Write operator docs

**Files:**
- Create: `README.md`
- Create: `docs/usage/local-setup.md`

**Step 1: Write the failing docs checklist**

Document these required sections:

```md
- install
- run locally
- configure agent paths
- preview sync
- apply sync
- conflict behavior
```

**Step 2: Run docs sanity check**

Run: `rg -n "preview sync|conflict behavior|configure agent paths" README.md docs/usage/local-setup.md`
Expected: FAIL until docs are written

**Step 3: Write minimal implementation**

- explain local-only architecture
- explain config file format
- explain safe sync rules
- explain known limitations

**Step 4: Run docs sanity check**

Run: `rg -n "preview sync|conflict behavior|configure agent paths" README.md docs/usage/local-setup.md`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 16: Final verification

**Files:**
- Modify: any touched files from prior tasks as needed

**Step 1: Run unit tests**

Run: `npx vitest run`
Expected: PASS

**Step 2: Run e2e tests**

Run: `npx playwright test`
Expected: PASS

**Step 3: Run lint**

Run: `npm run lint`
Expected: PASS

**Step 4: Run production build**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.
