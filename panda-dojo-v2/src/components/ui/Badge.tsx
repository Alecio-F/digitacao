import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'special'
  | 'muted';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = 'default', className = '', children, ...rest }: BadgeProps) {
  const normalizedVariant = variant === 'muted' ? 'default' : variant;
  const cls = [styles.badge, styles[normalizedVariant], className].filter(Boolean).join(' ');

  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
