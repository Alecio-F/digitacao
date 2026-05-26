import styles from './MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
}

export function MetricCard({ label, value, highlight = false, className = '' }: MetricCardProps) {
  const cls = [styles.metric, highlight ? styles.highlight : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
