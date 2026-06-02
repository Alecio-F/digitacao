import type { HTMLAttributes } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'interactive' | 'hud' | 'locked';
export type CardPadding = 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'article' | 'section';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  as?: CardElement;
  locked?: boolean;
}

export function Card({
  variant = 'default',
  padding = 'md',
  as: Component = 'div',
  locked = false,
  className = '',
  children,
  ...rest
}: CardProps) {
  const resolvedVariant: CardVariant = locked ? 'locked' : variant;
  const cls = [
    styles.card,
    styles[resolvedVariant],
    styles[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={cls} data-locked={resolvedVariant === 'locked' || undefined} {...rest}>
      {children}
    </Component>
  );
}
