import { SkillsBoard } from "@/src/components/board/skills-board";
import { PageHeader } from "@/src/components/ui/page-header";
import { buildSkillBoardModel } from "@/src/lib/server/build-skill-board-model";

export default async function HomePage() {
  const model = await buildSkillBoardModel();

  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Skills"
        title="Skills 与规则管理"
        description="直接管理 skill、安装位置和 SKILL.md。"
      />
      <SkillsBoard model={model} />
    </main>
  );
}
