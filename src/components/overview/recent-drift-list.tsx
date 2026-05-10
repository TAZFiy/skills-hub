import { StatusPill } from "@/src/components/ui/status-pill";
import type { SkillInstallState } from "@/src/types/skills";

export function RecentDriftList({ items }: { items: SkillInstallState[] }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">近期异常</p>
          <h2 className="card-title">先处理最容易出问题的边缘项</h2>
        </div>
        <p className="card-copy">
          这些项目最容易阻塞一次干净的同步执行。
        </p>
      </div>
      <div className="list">
        {items.length === 0 ? (
          <div className="list-item">
              <div>
              <h3 className="card-title">没有紧急异常</h3>
              <p className="card-copy">
                当前受管目标目录整体状态正常，可以进行常规同步。
              </p>
            </div>
          </div>
        ) : (
          items.map((item) => (
            <article key={`${item.agentId}-${item.skillName}`} className="list-item">
              <div>
                <h3 className="card-title" style={{ fontSize: "1.05rem", marginBottom: 6 }}>
                  {item.skillName}
                </h3>
                <p className="card-copy">
                  {item.agentName} · {item.detail}
                </p>
              </div>
              <StatusPill status={item.status} />
              <span className="stat-detail">{item.targetPath}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
