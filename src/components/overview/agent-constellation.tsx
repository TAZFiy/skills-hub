import { summarizeStates } from "@/src/lib/skills/classify-install-state";
import type { AgentDefinition } from "@/src/types/agents";
import type { SkillInstallState } from "@/src/types/skills";

export function AgentConstellation({
  agents,
  states
}: {
  agents: AgentDefinition[];
  states: Record<string, SkillInstallState[]>;
}) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">工具分布</p>
          <h2 className="card-title">所有目标目录，一眼看全</h2>
        </div>
        <p className="card-copy">
          每个工具的覆盖率和漂移情况都直接显示出来，不再埋在文件系统细节里。
        </p>
      </div>
      <div className="agent-grid">
        {agents.map((agent) => {
          const summary = summarizeStates(states[agent.id] || []);
          const total = Object.values(summary).reduce((sum, value) => sum + value, 0) || 1;
          return (
            <article key={agent.id} className="agent-card">
              <div>
                <p className="eyebrow">{agent.id}</p>
                <h3 className="card-title">{agent.name}</h3>
                <p className="stat-detail">{agent.skillsPath}</p>
              </div>
              <div className="bar-track" aria-hidden="true">
                {Object.entries(summary).map(([status, count]) => (
                  <span
                    key={status}
                    className="bar-segment"
                    data-status={status}
                    style={{ width: `${(count / total) * 100}%` }}
                  />
                ))}
              </div>
              <div className="summary-grid">
                {Object.entries(summary).map(([status, count]) => (
                  <div key={status}>
                    <div className="stat-value" style={{ fontSize: "1.2rem", margin: "0 0 6px" }}>
                      {count}
                    </div>
                    <div className="stat-detail">{status}</div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
