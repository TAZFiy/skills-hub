# Global Rules Editing Design

**Date:** 2026-03-23

**Status:** Approved for planning

## Goal

Extend the existing Global Rules workspace so users can create and edit supported global rule files directly in the browser.

This feature should let the user:

- open an existing global rule file
- modify it in the page
- review a save confirmation before writing
- create a missing supported rule file from the same workspace

## Confirmed Scope

This feature is intentionally limited to global rule files only.

Supported files:

- `~/.claude/CLAUDE.md`
- `~/.claude/rules/**/*.md`
- `$CODEX_HOME/AGENTS.md` or `~/.codex/AGENTS.md`
- `$CODEX_HOME/AGENTS.override.md` or `~/.codex/AGENTS.override.md`

Explicitly excluded:

- any project-local rules
- Claude settings files
- Claude auto memory
- Codex config files
- delete or rename flows
- bulk editing

## Product Behavior

The page keeps the current three-column layout, but the detail panel becomes stateful.

### Read-only state

Default state for every selected asset.

Behavior:

- show file metadata
- show content preview
- show `编辑` for existing supported files
- show `创建` for missing supported files

### Editing state

Entered after `编辑` or `创建`.

Behavior:

- replace preview with an editor surface
- keep the selected asset fixed while editing
- show `取消` and `保存`
- track dirty state locally

### Confirmation state

Entered after pressing `保存`.

Behavior:

- open a confirmation layer in the detail area
- show full target path
- show whether this action creates a new file or overwrites an existing file
- require explicit confirm before any write happens

## Interaction Rules

- `编辑` opens the selected file content in an editor.
- `创建` opens an empty or lightly seeded draft for a supported missing file.
- `取消` exits edit mode and discards unsaved changes.
- `保存` does not write immediately. It first enters confirmation.
- `确认保存` performs the write through a server route.
- after success, the page refreshes and returns to read-only mode

## File Creation Rules

### Claude main file

Allowed target:

- `~/.claude/CLAUDE.md`

If the file does not exist, creation is allowed.

### Claude rules

Allowed targets:

- any markdown file under `~/.claude/rules/`

Creation should work through a controlled relative path input, for example:

- `frontend/testing.md`
- `api/validation.md`

The server must resolve this relative path under `~/.claude/rules/` and reject anything outside that subtree.

### Codex root files

Allowed targets:

- `$CODEX_HOME/AGENTS.md` or `~/.codex/AGENTS.md`
- `$CODEX_HOME/AGENTS.override.md` or `~/.codex/AGENTS.override.md`

If either file is missing, creation is allowed only at those exact paths.

## Data Model Changes

Extend the instructions domain model with editing metadata.

### InstructionAsset additions

- `isEditable`
- `canCreate`
- `contentHash`

`contentHash` should represent the currently scanned file content and be used for optimistic overwrite protection.

## API Design

Add one mutation endpoint:

- `POST /api/instructions/save`

Request body:

- `agent`
- `path`
- `content`
- `previousHash`
- `mode`: `create` | `update`

Response body:

- `ok`
- `path`
- `contentHash`
- `exists`

## Server-side Safety Rules

The save API must never behave like a generic file writer.

Allowed writes must be limited to:

- exact Claude main file path
- markdown files under `~/.claude/rules/`
- exact Codex root `AGENTS.md`
- exact Codex root `AGENTS.override.md`

The API must reject:

- paths outside those allowlists
- path traversal such as `..`
- non-markdown Claude rule creations
- writes that target symlink escapes

## Concurrency Rule

The API should compare the request `previousHash` with the current on-disk hash.

If they differ:

- reject the save
- return a conflict-style error
- tell the client to refresh before retrying

This is enough for v1. No multi-user merge flow is needed.

## UX Principles

- writing must be explicit, never silent
- the confirmation step is required for both create and update
- the workspace should still feel like an inspector first, editor second
- missing files should be creatable only when they are part of the approved global rule set

## Technical Architecture

Add a small write layer beside the existing scanner layer.

Suggested additions:

- `src/lib/instructions/hash-instruction-content.ts`
- `src/lib/instructions/save-instruction-asset.ts`
- `app/api/instructions/save/route.ts`

Update existing UI:

- `src/components/instructions/instructions-workspace.tsx`

Update types:

- `src/types/instructions.ts`

## Success Criteria

This feature is successful if the user can:

- edit an existing supported global rule file
- create a missing supported global rule file
- review a confirmation before write
- get a clear error when the file changed on disk before saving

And it is unsuccessful if the implementation expands into:

- arbitrary file editing
- project rule editing
- delete flows
- config file editing
