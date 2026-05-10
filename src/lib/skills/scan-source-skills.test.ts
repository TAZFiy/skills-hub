import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, describe, expect, it } from "vitest";

import { scanSourceSkills } from "@/src/lib/skills/scan-source-skills";

const tempDirs: string[] = [];

async function makeSkill(root: string, name: string, description: string) {
  const skillDir = join(root, name);
  await mkdir(skillDir, { recursive: true });
  await writeFile(
    join(skillDir, "SKILL.md"),
    `---\nname: ${name}\ndescription: ${description}\n---\n`
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
});
