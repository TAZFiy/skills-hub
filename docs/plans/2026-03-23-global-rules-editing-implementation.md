# Global Rules Editing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add browser-based create and edit flows for supported global Claude Code and Codex rule files, with mandatory save confirmation and overwrite protection.

**Architecture:** Keep the existing read-only scanner as the source of truth, then layer a tightly scoped mutation path on top. The UI stays in the current three-column workspace, but the detail panel becomes stateful with view, edit, and confirm modes. Server writes are limited by an allowlist and protected with content hashes so this does not become a generic filesystem editor.

**Tech Stack:** Next.js App Router, React, TypeScript, Node `fs`/`path`/`crypto`, Vitest

---

### Task 1: Extend instruction asset types for editing

**Files:**
- Modify: `src/types/instructions.ts`

**Step 1: Write the failing type target**

Add a compile target that expects editing metadata:

```ts
const asset = {
  isEditable: true,
  canCreate: true,
  contentHash: "abc123"
};
```

**Step 2: Run type-aware build to verify it fails**

Run: `npm run build`
Expected: FAIL because the type does not include editing fields yet

**Step 3: Write minimal implementation**

- add `isEditable`
- add `canCreate`
- add `contentHash`

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 2: Add content hashing utility

**Files:**
- Create: `src/lib/instructions/hash-instruction-content.ts`
- Create: `src/lib/instructions/hash-instruction-content.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { hashInstructionContent } from "./hash-instruction-content";

describe("hashInstructionContent", () => {
  it("returns a stable hash for identical content", () => {
    expect(hashInstructionContent("abc")).toBe(hashInstructionContent("abc"));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/instructions/hash-instruction-content.test.ts`
Expected: FAIL because the utility does not exist

**Step 3: Write minimal implementation**

- use Node `crypto`
- hash utf8 content
- return a short stable digest string

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/instructions/hash-instruction-content.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 3: Update scanners to expose edit metadata

**Files:**
- Modify: `src/lib/instructions/scan-claude-instructions.ts`
- Modify: `src/lib/instructions/scan-codex-instructions.ts`
- Modify: `src/lib/instructions/scan-claude-instructions.test.ts`
- Modify: `src/lib/instructions/scan-codex-instructions.test.ts`

**Step 1: Write the failing assertions**

```ts
expect(asset.isEditable).toBe(true);
expect(asset.canCreate).toBe(true);
expect(asset.contentHash).toBeTruthy();
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: FAIL because scanners do not provide the new fields

**Step 3: Write minimal implementation**

- mark supported global rule assets as editable
- mark missing supported assets as creatable
- compute `contentHash` from file content when present
- return `null` or empty hash semantics consistently for missing files

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 4: Build the scoped save service

**Files:**
- Create: `src/lib/instructions/save-instruction-asset.ts`
- Create: `src/lib/instructions/save-instruction-asset.test.ts`

**Step 1: Write the failing test**

```ts
it("writes an allowed Claude rule file", async () => {
  const result = await saveInstructionAsset({
    agent: "claude",
    path: "/tmp/.claude/rules/testing.md",
    content: "# Rule",
    previousHash: null,
    mode: "create"
  });
  expect(result.exists).toBe(true);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: FAIL because the service does not exist

**Step 3: Write minimal implementation**

- validate allowed target paths
- reject traversal and out-of-scope writes
- create parent directories for allowed files
- compare `previousHash` with current on-disk content hash
- write utf8 content
- return updated hash and existence

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 5: Expose the save API route

**Files:**
- Create: `app/api/instructions/save/route.ts`

**Step 1: Write the failing route contract**

Define the expected request payload:

```json
{
  "agent": "claude",
  "path": "/Users/me/.claude/CLAUDE.md",
  "content": "# rules",
  "previousHash": "abc",
  "mode": "update"
}
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL because the route does not exist

**Step 3: Write minimal implementation**

- parse and validate the JSON body
- call `saveInstructionAsset`
- return success payload on write
- return structured 4xx errors for invalid path or stale hash

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 6: Add edit mode to the Global Rules workspace

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing UI contract**

Define the interaction contract:

```tsx
// selected asset can switch between view, edit, and confirm states
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until the component supports the new states

**Step 3: Write minimal implementation**

- add `view`, `edit`, and `confirm` modes
- add a textarea editor in the detail pane
- add `编辑`, `创建`, `取消`, `保存`
- keep local draft state and dirty tracking
- keep the selected file stable while editing

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 7: Add save confirmation UX

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`
- Modify: `app/globals.css`

**Step 1: Write the failing behavior expectation**

Define the rule:

```tsx
// clicking save must not write immediately; it must open a confirmation state first
```

**Step 2: Run build to verify it fails**

Run: `npm run build`
Expected: FAIL until confirmation mode is wired

**Step 3: Write minimal implementation**

- add a confirmation panel or inline confirmation block
- show full target path
- distinguish create versus overwrite
- require explicit confirm before calling the API

**Step 4: Run build to verify it passes**

Run: `npm run build`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 8: Support creating new Claude rule files

**Files:**
- Modify: `src/components/instructions/instructions-workspace.tsx`
- Modify: `src/lib/instructions/save-instruction-asset.ts`
- Modify: `src/lib/instructions/save-instruction-asset.test.ts`

**Step 1: Write the failing test**

```ts
it("creates a new file under ~/.claude/rules from a relative rule path", async () => {
  // expect frontend/testing.md to resolve inside ~/.claude/rules
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: FAIL until create-path logic exists

**Step 3: Write minimal implementation**

- add a controlled relative path field for new Claude rules
- resolve it under `~/.claude/rules/`
- require `.md` suffix
- reject invalid relative paths

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 9: Add mutation regression coverage

**Files:**
- Create: `tests/fixtures/instructions/editing/...`
- Modify: `src/lib/instructions/save-instruction-asset.test.ts`

**Step 1: Write the failing cases**

Add coverage for:

```ts
expect(error.code).toBe("STALE_CONTENT");
expect(error.code).toBe("INVALID_PATH");
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: FAIL until conflict and path rejection are implemented

**Step 3: Write minimal implementation**

- add fixture-backed tests for:
  - updating an existing file
  - creating a missing file
  - stale hash rejection
  - invalid path rejection
  - invalid file extension rejection

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 5: Commit**

Skip until git is available.

### Task 10: Final verification

**Files:**
- Modify: none unless fixes are required

**Step 1: Run targeted tests**

Run: `npx vitest run src/lib/instructions/hash-instruction-content.test.ts src/lib/instructions/scan-claude-instructions.test.ts src/lib/instructions/scan-codex-instructions.test.ts src/lib/instructions/save-instruction-asset.test.ts`
Expected: PASS

**Step 2: Run production validation**

Run: `npm run build`
Expected: PASS

**Step 3: Manual verification**

Run: `npm run dev`
Expected:

- existing global rule files can enter edit mode
- missing supported files can enter create mode
- clicking save opens confirmation first
- confirming save writes the file and refreshes the view
- stale writes show a refresh message instead of overwriting

**Step 4: Capture follow-up issues**

- note whether delete should ever be supported
- note whether rule templates are worth adding later

**Step 5: Commit**

Skip until git is available.
