# Page Design Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the Skills Hub main page into a clearer local operations console without changing sync behavior.

**Architecture:** Keep the existing Next.js App Router and React client component boundaries. Change only the app shell, `SkillsBoard` presentation markup, global CSS, and task documentation unless verification reveals a bug. Server-side board model and API contracts stay unchanged.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4 global CSS, lucide-react, Vitest.

---

### Task 1: Update Tracking Docs

**Files:**
- Modify: `tasks/todo.md`
- Create: `docs/plans/2026-05-14-page-design-optimization-design.md`
- Create: `docs/plans/2026-05-14-page-design-optimization-implementation.md`

**Steps:**

1. Record the approved spec, scope, research principles, task checklist, and validation checklist in `tasks/todo.md`.
2. Save the product design in the design doc.
3. Save this implementation plan.
4. Verify the docs use the same scope: UI polish and workflow clarity, no backend behavior changes.

### Task 2: Refine App Shell

**Files:**
- Modify: `src/components/app-shell.tsx`
- Modify: `src/components/sidebar-nav.tsx`
- Modify: `app/globals.css`

**Steps:**

1. Add concise operational context to the shell, such as "Local console".
2. Keep the two current navigation items only.
3. Improve active, hover, and focus styles in CSS.
4. Confirm navigation remains usable at desktop and mobile widths.

### Task 3: Refine Skills Board Markup

**Files:**
- Modify: `src/components/board/skills-board.tsx`
- Modify: `app/globals.css`

**Steps:**

1. Add derived board metrics for installed, missing, broken, custom, selected, and syncable selected counts.
2. Reorganize the toolbar into status summary, filter strip, search, selection, and primary action areas.
3. Add icon affordances from `lucide-react` for search, sync, detail, tag, delete, close, and status summary.
4. Add Escape key support for closing the active detail drawer.
5. Keep all existing button handlers and API calls.

### Task 4: Improve Responsive List Styling

**Files:**
- Modify: `app/globals.css`

**Steps:**

1. Keep desktop as a proper matrix table.
2. Add sticky table headers inside the scroll container.
3. Convert table rows into card-like blocks at narrow widths using CSS.
4. Make row actions wrap predictably and keep text inside buttons.
5. Confirm status pills and descriptions do not overlap.

### Task 5: Verify

**Files:**
- Modify: `tasks/todo.md`
- Modify: `tasks/lessons.md`

**Steps:**

1. Run `npx tsc --noEmit`.
2. Run `npm test`.
3. Start `npm run dev`.
4. Use the in-app browser to inspect desktop and mobile screenshots.
5. Fix any visual overlap or runtime issue found during verification.
6. Record results in `tasks/todo.md`.
7. Add one concise lesson to `tasks/lessons.md`.
