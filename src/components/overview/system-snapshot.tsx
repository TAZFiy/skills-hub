import { StatCard } from "@/src/components/ui/stat-card";

type Item = {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function SystemSnapshot({ items }: { items: Item[] }) {
  return (
    <section className="panel">
      <div className="section-head">
        <div>
          <p className="eyebrow">系统快照</p>
          <h2 className="card-title">先看清，再决定</h2>
        </div>
        <p className="card-copy">
          在进入矩阵之前，最重要的统计应该始终是可见的。
        </p>
      </div>
      <div className="snapshot-grid">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
    </section>
  );
}
