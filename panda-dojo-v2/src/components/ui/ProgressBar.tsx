import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  'aria-label': string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({ value, 'aria-label': ariaLabel, animated = false, className = '' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const cls = [styles.track, animated ? styles.animated : '', className].filter(Boolean).join(' ');
  return (
    <div
      className={cls}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <div className={styles.fill} style={{ width: `${clamped}%` }} />
    </div>
  );
}
