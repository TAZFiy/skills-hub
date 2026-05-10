# Global Rules Editing Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current mixed create/update global rules saving flow with separate create and update APIs, and make the UI re-fetch server-scanned truth after each successful mutation.

**Architecture:** Keep the read model centered on `/api/instructions`, but split writes into explicit `create` and `update` routes. The client should stop constructing synthetic assets after create and should instead re-fetch the instructions model after every successful mutation. This keeps filesystem truth on the server and turns the UI into a thin state machine instead of a mini sync engine.

**Tech Stack:** Next.js App Router, React, TypeScript, Node `fs`/`path`/`crypto`, Vitest

---

### Task 1: Stabilize the client state machine

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`

**Step 1: Write the failing state expectation**

Define the intended modes:

```ts
type WorkspaceMode = "view" | "editingExisting" | "creatingNew" | "confirm";
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until mode handling is updated consistently

**Step 3: Write minimal implementation**

- replace the current mixed create/edit mode structure
- remove any dependency on mutating `assets` to synthesize a new file after create
- keep one source of truth for selected file and editor draft

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 2: Split the write service into create and update paths

**Files:**
- Modify: `src/lib/instructions/save-instruction-asset.ts`
- Modify: `src/lib/instructions/save-instruction-asset.test.ts`

**Step 1: Write the failing service tests**

Add tests that distinguish create from update:

```ts
expect(error.code).toBe("ALREADY_EXISTS");
expect(error.code).toBe("NOT_FOUND");
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: FAIL because the service still treats create and update as one flow

**Step 3: Write minimal implementation**

- expose `createInstructionAsset`
- expose `updateInstructionAsset`
- make create reject if target exists
- make update reject if target does not exist
- keep path validation shared

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 3: Expand error codes and route responses

**Files:**
- Modify: `src/lib/instructions/save-instruction-asset.ts`
- Modify: `app/api/instructions/save/route.ts`
- Create: `app/api/instructions/create/route.ts`
- Create: `app/api/instructions/update/route.ts`

**Step 1: Write the failing route contracts**

Define the two new payloads:

```json
{ "agent": "claude", "kind": "rule", "category": "frontend", "fileName": "api-guardrails.md", "content": "# Rule" }
```

```json
{ "path": "/Users/me/.claude/CLAUDE.md", "content": "# Updated", "previousHash": "abc123" }
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until the new routes exist and the old mixed semantics are removed

**Step 3: Write minimal implementation**

- return machine-readable codes:
  - `ALREADY_EXISTS`
  - `STALE_CONTENT`
  - `INVALID_PATH`
  - `INVALID_EXTENSION`
  - `NOT_FOUND`
- map create conflicts to 409
- map stale update conflicts to 409
- keep unknown failures as 500

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 4: Simplify create form inputs

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing UI expectation**

Define the create contract:

```tsx
// creating a new Claude rule asks for category, file name, and content only
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until create and edit are visually separated

**Step 3: Write minimal implementation**

- keep category selector
- keep file name input
- remove any hidden coupling to selected missing assets
- create requests should use structured inputs, not raw target paths

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 5: Re-fetch instructions after successful mutation

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`

**Step 1: Write the failing behavior expectation**

Define the rule:

```tsx
// after create or update succeeds, the component re-fetches /api/instructions and replaces local model state
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until post-save sync flow is updated

**Step 3: Write minimal implementation**

- extract a reusable `loadInstructions()` helper
- call it after successful create
- call it after successful update
- replace `assets` and `model` from the fresh payload
- re-select the saved file by path if possible

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 6: Remove the mixed save route usage from the client

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`

**Step 1: Write the failing behavior expectation**

Define the rule:

```tsx
// create calls /api/instructions/create and update calls /api/instructions/update
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until the component stops using the mixed save route

**Step 3: Write minimal implementation**

- dispatch create and update to different endpoints
- only send `previousHash` on update
- only send structured category/fileName data on create

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 7: Add regression tests for conflict clarity

**Files:**
- Modify: `src/lib/instructions/save-instruction-asset.test.ts`

**Step 1: Write the failing tests**

Add assertions for:

```ts
expect(error.code).toBe("ALREADY_EXISTS");
expect(error.code).toBe("STALE_CONTENT");
expect(error.code).toBe("NOT_FOUND");
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: FAIL until create/update semantics are split

**Step 3: Write minimal implementation**

- cover create-existing conflict
- cover update-missing rejection
- cover stale hash rejection

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 8: Final verification

**Files:**
- Modify: none unless fixes are required

**Step 1: Run targeted tests**

Run: `npx vitest run src/lib/instructions/hash-instruction-content.test.ts src/lib/instructions/save-instruction-asset.test.ts src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: PASS

**Step 2: Run production validation**

Run: `npm run build`
Expected: PASS

**Step 3: Manual verification**

Run: `npm run dev`
Expected:

- existing file edits succeed without create semantics leaking in
- new Claude rules create cleanly with category + file name only
- successful create reappears after a fresh `/api/instructions` load
- 409 errors distinguish existing-file conflicts from stale-content conflicts

**Step 4: Capture follow-up issues**

- decide whether root-file creation should also use a thin creation wizard
- decide whether success toasts should replace inline status copy

**Step 5: Commit**

Skip until git is available.
