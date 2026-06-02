import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Chip.module.css';

export type ChipVariant =
  | 'default'
  | 'cyan'
  | 'purple'
  | 'green'
  | 'yellow'
  | 'special'
  | 'success'
  | 'danger'
  | 'muted';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
  icon?: ReactNode;
  variant?: ChipVariant;
  children: ReactNode;
}

function normalizeVariant(variant: ChipVariant) {
  if (variant === 'special') return 'purple';
  if (variant === 'success') return 'green';
  if (variant === 'muted') return 'default';
  return variant;
}

export function Chip({
  active = false,
  icon,
  variant = 'default',
  className = '',
  children,
  ...rest
}: ChipProps) {
  const normalizedVariant = normalizeVariant(variant);
  const cls = [
    styles.chip,
    styles[normalizedVariant],
    active ? styles.active : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={cls} {...rest}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
