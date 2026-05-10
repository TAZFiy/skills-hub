# Skills Hub Local Web Console Design

**Date:** 2026-03-22

**Status:** Approved for planning

## Goal

Build a local web console that manages AI coding agent skills from one place. The system uses `/Users/liuxingqi/.agents/skills` as the single source of truth and synchronizes skills to agent-specific directories such as Claude Code, Codex, Cursor, Cline, and Windsurf.

## Problem

Skills are currently scattered across multiple tool-specific directories. Some are first-party, some are third-party, and some are custom. This makes it hard to:

- see which skills exist
- know which agent has which skill installed
- detect broken symlinks or drifted copies
- safely synchronize updates from one source to many targets

## Product Scope

Version 1 is a local-first management console. It runs on the same machine as the skills directories and directly reads and writes the local filesystem.

Included in v1:

- scan source and target skills directories
- display a unified registry of skills
- show per-agent install state
- preview sync actions before execution
- create and repair symlink-based installs
- detect conflicts and orphaned installs
- rescan on demand

Excluded from v1:

- cloud sync
- online editing of `SKILL.md`
- user accounts
- remote deployment
- database-backed history

## Source of Truth

Primary source directory:

- `/Users/liuxingqi/.agents/skills`

Initial target directories:

- `/Users/liuxingqi/.claude/skills`
- `/Users/liuxingqi/.codex/skills`
- `/Users/liuxingqi/.cursor/skills`
- `/Users/liuxingqi/.cline/skills`
- `/Users/liuxingqi/.windsurf/skills`

The sync direction is always source to target. The UI must make that rule explicit.

## Core User Flows

### 1. Inspect overall system health

The user opens the console and immediately sees:

- total source skills
- number of connected agents
- synced items
- drifted items
- conflict items

### 2. Inspect one skill across all agents

The user opens the registry page, finds a skill, and sees its state across all agents in a matrix.

### 3. Preview sync

The user requests a sync preview and sees categorized actions:

- create symlink
- repair symlink
- skip conflict
- remove orphaned link (optional manual action only)

### 4. Apply sync

The user confirms execution. The system applies only safe, managed actions and reports success or failure per item.

## Information Architecture

### Overview

Landing page for system health and recent drift.

Sections:

- system snapshot cards
- agent constellation grid
- recent drift list
- quick actions for rescan and preview sync

### Registry

Primary workspace. Shows a skill-by-agent matrix.

Left-side columns:

- skill name
- short description
- last updated

Agent columns:

- one status cell per agent

Detail drawer:

- source path
- parsed `SKILL.md` metadata
- target paths
- symlink target
- available actions

### Agents

One card per agent, summarizing:

- target path
- total installed skills
- managed skills
- orphaned skills
- conflicts

### Sync Studio

Preview and execution screen for synchronization.

Action groups:

- links to create
- links to repair
- conflicts to skip
- orphaned items to review

## State Model

Every skill-agent pair uses one of these states:

- `synced`: target exists and correctly points to source
- `missing`: source exists and target does not
- `drifted`: target exists but points elsewhere or differs from source
- `conflict`: target exists as an unmanaged directory and should not be overwritten automatically
- `orphaned`: target exists but source skill is missing

These states must always appear as text plus icon plus color. Color alone is not enough.

## Sync Rules

- default installation method is symlink
- existing correct symlink is left unchanged
- broken or mispointed symlink can be repaired
- unmanaged directories with the same name are treated as conflicts
- destructive overwrite is not allowed in v1
- every sync run begins with preview

## Technical Architecture

The recommended implementation is a local Next.js application with server-side filesystem access.

Layers:

1. UI layer
   Renders the management console and interaction flows.

2. Service layer
   Scans directories, builds normalized models, computes drift, and creates sync plans.

3. Adapter layer
   Defines agent-specific paths and target capabilities.

No database is required in v1. The application can derive state from filesystem scans and a small local config file.

## Data Model

### Skill

- `name`
- `sourcePath`
- `description`
- `hasSkillMd`
- `updatedAt`

### Agent

- `id`
- `name`
- `skillsPath`
- `enabled`

### SkillInstallState

- `skillName`
- `agentId`
- `status`
- `targetPath`
- `linkTarget`
- `isManaged`

### SyncAction

- `type`
- `skillName`
- `agentId`
- `reason`

## UI Direction

This product should not look like a generic SaaS admin panel.

Design direction:

- editorial industrial
- pale paper background
- dark graphite text
- oxidized green accents
- dense but readable control surface
- serif display typography paired with technical mono or condensed sans for paths and state labels

Interaction rules:

- visible focus states
- touch targets at least 44px
- clear loading and error feedback
- status filters reachable in one click
- reduced motion support

## Error Handling

The system must handle:

- unreadable directories
- missing target directories
- broken symlinks
- invalid `SKILL.md`
- duplicate skill names in different places

Errors should be shown inline in the relevant page and summarized in Sync Studio results.

## Security and Safety

The console operates on local filesystem paths only. It must:

- restrict writes to configured skills directories
- validate that created symlinks point into the approved source root
- avoid automatic destructive actions
- clearly label managed versus unmanaged entries

## Testing Strategy

The implementation should use fixture directories and temporary paths to test:

- scan results
- state classification
- sync planning
- symlink creation
- symlink repair
- conflict detection

UI tests should cover:

- overview rendering
- registry matrix filtering
- sync preview rendering
- error states

## Open Decisions Deferred

These are intentionally deferred beyond v1:

- inline `SKILL.md` editing
- Git sync and version history
- multi-machine sharing
- packaged desktop app

## Success Criteria

v1 is successful if the user can:

- see all source skills in one screen
- see each skill's install state across multiple agents
- preview exactly what a sync will do
- apply a safe sync without going back to the terminal
- detect and repair drifted symlinks from the UI
