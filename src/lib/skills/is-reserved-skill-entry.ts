const RESERVED_SKILL_ENTRY_NAMES = new Set([".system"]);

export function isReservedSkillEntry(name: string): boolean {
  return name.startsWith(".") || RESERVED_SKILL_ENTRY_NAMES.has(name);
}
