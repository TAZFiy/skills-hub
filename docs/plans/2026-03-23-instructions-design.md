# Instructions Workspace Design

**Date:** 2026-03-23

**Status:** Approved for planning

## Goal

Extend the local Skills Hub website with a new workspace for agent instruction files, focused on Claude Code and Codex.

The product should help answer:

- which files actually influence Claude Code behavior
- which files actually influence Codex behavior
- where those files live
- how they load and what scope they apply to

## Problem

The current website only models skills and sync state. That is useful for reusable workflows, but it does not explain the other half of agent behavior: persistent instructions.

This creates confusion around questions like:

- should baseline rules only live in `CLAUDE.md`
- should Codex be modeled the same way as Claude Code
- where should project-wide rules versus user preferences live
- which files are advisory instructions versus hard configuration

## Product Scope

Version 1 of this feature adds read-only visibility into instruction files for Claude Code and Codex.

Included in v1:

- scan and display Claude Code project instruction files
- scan and display Codex project instruction files
- classify files by agent, scope, and role
- explain load behavior and precedence in the UI
- preview file content directly in the website

Excluded from v1:

- editing instruction files in the browser
- writing or synchronizing instruction files
- user-level configuration management
- Claude auto memory management
- Codex config, skills, or MCP management

## Source Model

This feature should treat instruction files as first-class assets, separate from skills.

### Claude Code

Project-scoped files included in v1:

- `./CLAUDE.md`
- `./.claude/CLAUDE.md`
- `./.claude/rules/**/*.md`

Files explicitly not scanned in v1:

- `~/.claude/CLAUDE.md`
- `~/.claude/rules/**/*.md`
- `.claude/settings.json`
- `.claude/settings.local.json`
- `~/.claude/projects/<project>/memory/**`

### Codex

Project-scoped files included in v1:

- `AGENTS.md` files from the project root down to the current working directory
- `AGENTS.override.md` files found along the same directory chain

Files explicitly not scanned in v1:

- `$CODEX_HOME/AGENTS.md`
- `$CODEX_HOME/AGENTS.override.md`
- `~/.codex/config.toml`
- project or global skill directories

## Why This Scope

The first release should answer the user’s immediate conceptual problem: where core rules belong in Claude Code and Codex.

That question is primarily about instruction surfaces, not about runtime policy or generated memory. Mixing config and memory into the first release would blur the model and make the UI look authoritative in places where behavior is actually controlled elsewhere.

## Information Architecture

Add a new top-level workspace in the app shell.

Recommended label:

- `Instructions`

Alternative Chinese label for UI copy:

- `规则与指令`

The page should have a three-panel layout:

### 1. Filter rail

Filters:

- agent: Claude Code, Codex
- scope: project, directory, rule file
- status: found, missing

### 2. Asset list

One row per instruction asset.

Primary fields:

- title
- agent
- kind
- path
- scope
- short load summary

### 3. Detail panel

When an item is selected, show:

- full absolute path
- why the file matters
- how it loads
- precedence notes
- content preview
- related files in the same chain

## Unified Data Model

Introduce a new domain model for instruction assets rather than extending the skills types.

### InstructionAsset

- `id`
- `agent`: `claude` | `codex`
- `kind`: `main` | `rule` | `override` | `nested`
- `scope`: `project` | `directory`
- `path`
- `exists`
- `title`
- `description`
- `loadBehavior`
- `priority`
- `parentPath`
- `contentPreview`

### InstructionSurface

- `agent`
- `rootPath`
- `assets`
- `summary`

Summary should include counts for:

- main files
- rule files
- nested files
- recommended-but-missing files

## Scan Rules

### Claude Code scanner

Behavior:

- look for `CLAUDE.md` in the project root
- look for `.claude/CLAUDE.md`
- recursively scan `.claude/rules/` for markdown files
- parse frontmatter only when needed to detect path-scoped rules

UI meaning:

- root or `.claude/CLAUDE.md` is a broad project instruction surface
- `.claude/rules/*.md` is modular guidance
- rules with `paths` frontmatter should be labeled as conditional

### Codex scanner

Behavior:

- walk the directory chain from the repository root to the active working directory
- collect every `AGENTS.md`
- collect every `AGENTS.override.md`
- preserve the chain order for precedence display

UI meaning:

- deeper files are more specific
- `AGENTS.override.md` should be visually distinguished from `AGENTS.md`
- the page should explain that Codex aggregates instructions from multiple locations

## UX Principles

- Do not imply that one file is the only source of truth for an agent.
- Always separate advisory instruction files from enforced configuration.
- Make scope visible in plain language, not only via file paths.
- Prefer explanation over action in the first release.

## Non-Goals

- no browser editor
- no mutation APIs
- no sync workflow
- no attempt to reconstruct full live context from global files, settings, and memory

## Technical Architecture

Add a new server-side scanning layer:

- `src/lib/instructions/scan-claude-instructions.ts`
- `src/lib/instructions/scan-codex-instructions.ts`
- `src/lib/server/build-instructions-model.ts`

Add new shared types:

- `src/types/instructions.ts`

Add a new route:

- `app/instructions/page.tsx`

Add new presentation components:

- `src/components/instructions/instructions-workspace.tsx`

## Success Criteria

This feature is successful if a user can open the new page and immediately understand:

- Claude Code should not be modeled as only `CLAUDE.md`
- Codex uses `AGENTS.md` rather than `CLAUDE.md`
- both agents may load multiple project-level instruction files
- this release is showing instruction files only, not every possible config source
