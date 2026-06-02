import styles from './MetricCard.module.css';

export type MetricTone = 'default' | 'success' | 'warning' | 'danger' | 'special';

export interface MetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  tone?: MetricTone;
  compact?: boolean;
  highlight?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  helper,
  tone = 'default',
  compact = false,
  highlight = false,
  className = '',
}: MetricCardProps) {
  const resolvedTone = highlight ? 'special' : tone;
  const cls = [
    styles.metric,
    styles[resolvedTone],
    compact ? styles.compact : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} aria-label={`${label}: ${value}`}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
      {helper && <span className={styles.helper}>{helper}</span>}
    </div>
  );
}
