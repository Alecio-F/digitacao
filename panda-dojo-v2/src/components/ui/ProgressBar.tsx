import styles from './ProgressBar.module.css';

export type ProgressBarSize = 'sm' | 'md' | 'lg';
export type ProgressBarTone = 'default' | 'success' | 'special';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: ProgressBarSize;
  tone?: ProgressBarTone;
  animated?: boolean;
  className?: string;
  'aria-label'?: string;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  size = 'md',
  tone = 'default',
  animated = false,
  className = '',
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const normalizedMax = max > 0 ? max : 100;
  const clampedValue = clamp(value, 0, normalizedMax);
  const percent = Math.round((clampedValue / normalizedMax) * 100);
  const accessibleLabel = ariaLabel ?? label ?? 'Progresso';
  const cls = [
    styles.progress,
    styles[size],
    styles[tone],
    animated ? styles.animated : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls}>
      {(label || showValue) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && <span className={styles.value}>{percent}%</span>}
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={normalizedMax}
        aria-valuenow={clampedValue}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
