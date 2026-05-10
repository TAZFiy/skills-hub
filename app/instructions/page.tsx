import { InstructionsWorkspace } from "@/src/components/instructions/instructions-workspace";
import { PageHeader } from "@/src/components/ui/page-header";

export default function InstructionsPage() {
  return (
    <main className="page-stack">
      <PageHeader
        eyebrow="Markdown Editor"
        title="规则编辑器"
        description="只编辑现有的 Claude 与 Codex 全局规则文件，保持最短操作路径。"
      />
      <InstructionsWorkspace />
    </main>
  );
}
