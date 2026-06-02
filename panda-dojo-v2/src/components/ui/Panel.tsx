import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Panel.module.css';

export type PanelElement = 'section' | 'aside' | 'div';

export interface PanelProps extends HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  as?: PanelElement;
  actions?: ReactNode;
}

export function Panel({
  title,
  subtitle,
  as: Component = 'div',
  actions,
  className = '',
  children,
  ...rest
}: PanelProps) {
  const hasHeader = title || subtitle || actions;

  return (
    <Component className={[styles.panel, className].filter(Boolean).join(' ')} {...rest}>
      {hasHeader && (
        <div className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      )}
      <div className={styles.body}>{children}</div>
    </Component>
  );
}
