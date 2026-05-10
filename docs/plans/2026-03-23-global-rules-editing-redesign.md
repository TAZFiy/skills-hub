# Global Rules Editing Redesign

**Date:** 2026-03-23

**Status:** Approved for planning

## Goal

Replace the current fragile mixed create-or-update editing flow with a simpler architecture for global rule editing.

The redesign should make these actions reliable:

- edit an existing global rule file
- create a new supported global rule file
- confirm writes before they happen
- recover cleanly after a successful save without page-level instability

## Problem

The current implementation mixes create and update into one mutation flow and tries to keep the page in sync by manually mutating local asset state.

That creates several failure modes:

- create requests can collide with already existing files
- `previousHash` semantics become ambiguous for create flows
- local asset state can drift from the true filesystem state
- server component and dev rebuild behavior become harder to reason about

This is too much complexity for a feature whose core job is writing one file safely.

## Design Decision

The new design separates creation and editing into different flows at both the UI and API layers.

### Core Rule

- `create` is only for paths that do not already exist
- `update` is only for paths that already exist

There should be no mixed `save` endpoint that tries to infer both behaviors.

## Supported Scope

This redesign keeps the same file scope:

- `~/.claude/CLAUDE.md`
- `~/.claude/rules/**/*.md`
- `$CODEX_HOME/AGENTS.md` or `~/.codex/AGENTS.md`
- `$CODEX_HOME/AGENTS.override.md` or `~/.codex/AGENTS.override.md`

Still excluded:

- project-local rules
- settings files
- delete
- rename
- bulk edit

## UI Model

The page remains a three-column workspace but the right side gets two distinct task modes.

### 1. View existing file

Default behavior when a scanned asset is selected.

Actions:

- `编辑` for existing files
- `创建` only for fixed missing root files like `CLAUDE.md` or `AGENTS.md`

### 2. Create new file

This is not derived from a missing scanned asset except for fixed root files.

For new Claude rule files:

- click `新建 Claude 规则`
- choose category
- choose file name
- edit content
- confirm create

This flow creates a file only if the target does not exist.

### 3. Edit existing file

For an already existing asset:

- select file
- click `编辑`
- modify content
- confirm update

This flow updates only if the target still matches the scanned `contentHash`.

## Data Flow

### Read path

- page shell loads
- client fetches `/api/instructions`
- UI renders from server-scanned truth

### Create path

- client submits `POST /api/instructions/create`
- server creates the file or returns `ALREADY_EXISTS`
- on success, client re-fetches `/api/instructions`
- UI replaces local data with the fresh scan result

### Update path

- client submits `POST /api/instructions/update`
- server checks `previousHash`
- on success, client re-fetches `/api/instructions`
- UI replaces local data with the fresh scan result

This removes the need to manually synthesize new `InstructionAsset` objects on the client.

## API Design

### `POST /api/instructions/create`

Purpose:

- create a supported global rule file only if it does not already exist

Request body:

- `agent`
- `kind`
- `category?`
- `fileName?`
- `content`

Behavior:

- resolve the exact target path from structured inputs
- reject if file already exists
- reject if resolved path is outside the allowlist
- write file and return path

Conflict response:

- `409 ALREADY_EXISTS`

### `POST /api/instructions/update`

Purpose:

- update an already existing supported global rule file

Request body:

- `path`
- `content`
- `previousHash`

Behavior:

- validate path is allowed
- require target file to exist
- compare on-disk content hash with `previousHash`
- write file and return path

Conflict response:

- `409 STALE_CONTENT`

## Error Semantics

The client should not have to guess what a `409` means.

Use explicit machine-readable codes:

- `ALREADY_EXISTS`
- `STALE_CONTENT`
- `INVALID_PATH`
- `INVALID_EXTENSION`
- `NOT_FOUND`

## Safety Rules

Both new APIs must keep the current write allowlist.

Allowed:

- exact Claude global root file
- markdown files under `~/.claude/rules/`
- exact Codex global root files

Rejected:

- traversal
- project-local paths
- non-markdown Claude rules
- symlink escapes

## Why This Is Better

This redesign removes the hardest parts of the current implementation:

- no dual-purpose save route
- no synthetic local asset insertion after create
- no need to treat creation like editing a missing asset
- no ambiguous `previousHash: null` semantics

The UI becomes easier to reason about because create and update no longer share the same write contract.

## Success Criteria

This redesign is successful if:

- creating a new Claude rule never depends on optimistic locking
- editing an existing file uses optimistic locking only for updates
- after every successful mutation, the page reflects the server-scanned truth
- `409` responses are specific and understandable
