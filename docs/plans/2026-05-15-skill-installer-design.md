# Skill Installer Design

## Goal

Add a local installer that accepts a GitHub skill repository URL or a local directory, discovers valid skill folders, and installs them into every enabled coding agent skills directory.

## Scope

- Add an installer API for GitHub URLs and local directories.
- Support repositories or directories that contain either one root `SKILL.md` or multiple child skill folders.
- Copy discovered skills into all enabled agent directories from `config/agents.json`.
- Keep existing sync, scan, delete, and custom tagging behavior unchanged.
- Refresh the existing board after installation so newly installed skills appear in the normal list.

## Non-Goals

- No automatic overwrite of existing target directories in the first version.
- No registry, package metadata, version solving, or dependency management.
- No background job queue.
- No installation into disabled agents.

## Architecture

- `src/lib/skills/install-skill-source.ts` owns parsing, cloning, discovery, validation, and file-copy behavior.
- `app/api/skills/install/route.ts` exposes a small POST endpoint used by the board.
- `src/components/board/skills-board.tsx` adds a compact install form near existing sync controls.
- Existing scanners remain the source of truth after installation.

## Input Handling

- GitHub HTTPS, SSH, and shorthand-style URLs are cloned into a temporary directory.
- Local absolute paths and home-relative paths are read directly.
- A discovered skill must be a directory with `SKILL.md` at its root.
- The installed directory name uses the folder name, because the scanner already treats directory names as the cross-agent identity.

## Safety

- Existing target directories are skipped and reported as conflicts.
- Local paths must exist and contain at least one valid skill.
- Git clone is run without shell interpolation by using `spawn`.
- Temporary clones are deleted after installation.

## Testing

- Unit tests cover root skill discovery, multi-skill discovery, existing-target conflicts, and local directory installation.
- API and UI behavior are validated by type checking and production build.
