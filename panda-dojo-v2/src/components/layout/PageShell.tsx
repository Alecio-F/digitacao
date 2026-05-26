import { useEffect, type ReactNode } from 'react';
import styles from './PageShell.module.css';

interface Props {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function PageShell({ title, children, className = '' }: Props) {
  useEffect(() => {
    if (title) document.title = `${title} — PandaDigitações`;
  }, [title]);

  return (
    <main className={[styles.shell, className].filter(Boolean).join(' ')}>
      {children}
    </main>
  );
}
