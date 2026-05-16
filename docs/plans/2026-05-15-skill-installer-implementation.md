# Skill Installer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a safe installer that accepts a GitHub skill repository URL or local directory and copies discovered skills into every enabled coding agent skills directory.

**Architecture:** Put install behavior in a server-side library that can be unit tested without Next.js. Expose it through one POST route and call it from the existing Skills Board so the current scan model remains the source of truth after installation.

**Tech Stack:** Next.js 15 route handlers, React 19 client component, Node `fs/promises`, Node `child_process.spawn`, Vitest.

---

### Task 1: Installer Library

**Files:**
- Create: `src/lib/skills/install-skill-source.ts`
- Test: `src/lib/skills/install-skill-source.test.ts`

**Steps:**

1. Add input parsing for local paths and GitHub URLs.
2. Add Git clone into `mkdtemp(tmpdir())` using `spawn("git", ["clone", "--depth", "1", source, target])`.
3. Add discovery:
   - root `SKILL.md` means one skill at root.
   - child directories with `SKILL.md` mean multiple skills.
4. Copy each discovered skill into each enabled agent `skillsPath`.
5. Skip existing targets and report them as conflicts.
6. Delete temporary clone directories in `finally`.
7. Unit test local root install, local multi-skill install, conflict skip, invalid source, and URL classification.

Run: `npm test -- src/lib/skills/install-skill-source.test.ts`

### Task 2: API Route

**Files:**
- Create: `app/api/skills/install/route.ts`

**Steps:**

1. Parse JSON payload `{ source: string }`.
2. Load enabled agents with `loadAgents()`.
3. Call `installSkillSource(source, agents)`.
4. Return result JSON.
5. Return `400` for invalid input and installer validation errors.
6. Return `500` for unexpected server errors.

Run: `npx tsc --noEmit`

### Task 3: Board UI

**Files:**
- Modify: `src/components/board/skills-board.tsx`
- Modify: `app/globals.css`

**Steps:**

1. Add local state for installer input, result, and error.
2. Add a compact install form near the existing sync controls.
3. POST to `/api/skills/install`.
4. Disable controls while installing.
5. Refresh the board after success.
6. Show concise installed / skipped / failed counts.

Run: `npm run build`

### Task 4: Documentation and Verification

**Files:**
- Modify: `README.md`
- Modify: `tasks/todo.md`
- Modify: `tasks/lessons.md`

**Steps:**

1. Document the new install behavior.
2. Mark task progress in `tasks/todo.md`.
3. Add review notes with exact verification commands.
4. Capture one reusable lesson.

Run:
- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- `git diff --check`
