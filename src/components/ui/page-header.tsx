export function PageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: string[];
  actions?: React.ReactNode;
}) {
  return (
    <section className="page-header page-header-compact page-header-plain">
      <div className="page-header-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="page-title">{title}</h1>
        <p className="page-description">{description}</p>
        {meta && meta.length > 0 ? (
          <div className="meta-row">
            {meta.map((item) => (
              <span key={item} className="meta-chip">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </section>
  );
}
