# Page Design Optimization Design

**Date:** 2026-05-14

**Status:** Approved for implementation

## Goal

Optimize the Skills Hub interface into a calmer, clearer local operations console. The page should preserve the current fast workflows while making status, filters, actions, and details easier to scan.

## Research Notes

Recent SaaS and admin dashboard guidance consistently points to the same patterns:

- Surface the highest-priority metrics above the fold.
- Keep search and filters visible for data-heavy workspaces.
- Put direct actions near the row or object they affect.
- Use consistent card/table rules so users can scan quickly.
- On narrow screens, convert dense tables into readable row cards instead of relying only on horizontal scrolling.

These patterns fit Skills Hub because it is a local resource-management tool, not a marketing site.

## Chosen Direction

Use a restrained "local control console" style:

- quiet neutral background
- crisp white work surfaces
- dark, legible navigation rail
- status colors reserved for installed, missing, broken, and custom states
- compact controls with icons where they reduce reading effort
- denser desktop layout, more card-like mobile layout

The design should feel more deliberate, but not ornamental. It should help the user answer:

1. Is anything missing or broken?
2. What should I sync?
3. Which skill am I inspecting?
4. Where is it installed?

## Page Structure

### App Shell

Keep the current topbar plus left navigation structure, but make the hierarchy stronger:

- topbar presents product identity and current local-console role
- left nav becomes a stable rail with clearer active state
- main content receives slightly wider breathing room on desktop

### Skills Page Header

The header should be compact and operational:

- title and description remain concise
- metric chips show total skills, pending sync, and agents when available
- no hero section or explanatory marketing block

### Skills Board

The board gets a stronger information hierarchy:

- toolbar split into status summary, filters, search, selection, and primary sync action
- filter buttons include counts and clear active state
- selection summary is always visible near batch actions
- errors appear as a compact alert below the toolbar

### Skills List

Desktop keeps the table because this is still a matrix task. Improve scanning by:

- tighter header styling
- sticky table header inside the scroll container
- stronger row hover and selected states
- more compact status pills
- visually grouping row actions
- using icons for detail/sync/delete affordances while keeping clear text

Mobile switches to a row-card presentation:

- hide table header
- each row becomes a compact card
- agent statuses wrap into a small status grid
- actions remain visible below the skill description
- avoid requiring users to discover horizontal scrolling for primary work

### Detail Drawer

Keep the drawer as an inspector:

- stronger header with skill name, custom badge, and sync state
- source path and targets remain visible
- `SKILL.md` code area gets more usable height
- add Escape-close behavior to match modal expectations

## Non-Goals

- Do not change sync semantics.
- Do not introduce a database or persistent UI preferences.
- Do not add a design system dependency.
- Do not rebuild `/instructions` in this pass.
- Do not reintroduce old registry, agents, or sync pages.

## Validation

- Run `npx tsc --noEmit`.
- Run `npm test`.
- Run the local Next.js dev server.
- Inspect desktop and mobile screenshots in the in-app browser.
- Confirm key operations remain reachable: search, filter, select, sync, tag custom, delete, open detail.
