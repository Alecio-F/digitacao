import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  locked?: boolean;
}

export function Card({ locked = false, className = '', children, ...rest }: CardProps) {
  const cls = [styles.card, locked ? styles.locked : styles.unlocked, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={cls} {...rest}>
      {children}
    </div>
  );
}
