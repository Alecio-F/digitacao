import type { HTMLAttributes } from 'react';
import styles from './Badge.module.css';

type Variant = 'success' | 'warning' | 'danger' | 'muted';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = 'muted', className = '', children, ...rest }: BadgeProps) {
  const cls = [styles.badge, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
