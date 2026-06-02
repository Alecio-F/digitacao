import { useEffect, type ReactNode } from 'react';
import styles from './PageShell.module.css';

interface PageShellProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}

export function PageShell({
  title,
  subtitle,
  eyebrow,
  children,
  className = '',
}: PageShellProps) {
  useEffect(() => {
    if (title) document.title = `${title} — PandaDigitações`;
  }, [title]);

  const showHeader = Boolean(title && (subtitle || eyebrow));

  return (
    <div className={[styles.shell, className].filter(Boolean).join(' ')}>
      {showHeader && (
        <header className={styles.header}>
          {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
          {title && <h1 className={styles.title}>{title}</h1>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}
      {children}
    </div>
  );
}
