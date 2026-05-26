import type { HTMLAttributes } from 'react';
import styles from './Chip.module.css';

type Variant = 'special' | 'success' | 'danger' | 'muted';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Chip({ variant = 'muted', className = '', children, ...rest }: ChipProps) {
  const cls = [styles.chip, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
