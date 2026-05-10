export function StatCard({
  label,
  value,
  detail,
  icon: Icon
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
}) {
  return (
    <article className="snapshot-card">
      <Icon size={18} />
      <p className="eyebrow">{label}</p>
      <div className="stat-value">{value}</div>
      <p className="stat-detail">{detail}</p>
    </article>
  );
}
