import clsx from "clsx";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "bg-surface rounded-xl shadow-card",
        padded && "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-text">{title}</h2>
        {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "positive",
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaTone?: "positive" | "warning" | "neutral";
  hint?: string;
}) {
  const deltaColors = {
    positive: "text-success",
    warning: "text-warm",
    neutral: "text-muted",
  };
  return (
    <div className="bg-surface rounded-xl shadow-card p-5">
      <div className="text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="stat-num text-3xl font-semibold text-text">{value}</div>
        {delta && <div className={`text-xs font-medium ${deltaColors[deltaTone]}`}>{delta}</div>}
      </div>
      {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
    </div>
  );
}
