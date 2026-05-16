import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { scanSourceSkills } from "@/src/lib/skills/scan-source-skills";

const tempDirs: string[] = [];

async function makeSkill(root: string, name: string, description: string, frontmatterName = name) {
  const skillDir = join(root, name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    join(skillDir, "SKILL.md"),
    `---\nname: ${frontmatterName}\ndescription: ${description}\n---\n`
  );
}

describe("scanSourceSkills", () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map(async (dir) =>
        import("node:fs/promises").then(({ rm }) =>
          rm(dir, { recursive: true, force: true })
        )
      )
    );
  });

  it("ignores reserved directories like .system", async () => {
    const root = await mkdtemp(join(tmpdir(), "scan-source-skills-"));
    tempDirs.push(root);

    await makeSkill(root, "frontend-design", "Visible skill");
    await makeSkill(join(root, ".system"), "health", "Reserved system skill");

    const skills = await scanSourceSkills(root);

    expect(skills.map((skill) => skill.name)).toEqual(["frontend-design"]);
  });

  it("uses the directory name when frontmatter names collide", async () => {
    const root = await mkdtemp(join(tmpdir(), "scan-source-skills-"));
    tempDirs.push(root);

    await makeSkill(root, "impeccable", "First skill", "impeccable");
    await makeSkill(root, "impeccable-extra", "Second skill", "impeccable");

    const skills = await scanSourceSkills(root);

    expect(skills.map((skill) => skill.name)).toEqual(["impeccable", "impeccable-extra"]);
  });
});
