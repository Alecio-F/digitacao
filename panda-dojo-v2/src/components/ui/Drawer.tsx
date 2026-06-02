import { useEffect, useId, type ReactNode } from 'react';
import { IconButton } from './IconButton';
import styles from './Drawer.module.css';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: 'left' | 'right';
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title = 'Painel',
  description,
  side = 'right',
  children,
}: DrawerProps) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  return (
    <>
      <button
        type="button"
        className={[styles.backdrop, open ? styles.backdropOpen : ''].filter(Boolean).join(' ')}
        aria-label="Fechar painel"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={[
          styles.drawer,
          styles[side],
          open ? styles.drawerOpen : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <header className={styles.header}>
          <div>
            <span className={styles.kicker}>Dojo Panel</span>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <IconButton icon="close" label="Fechar painel" onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
      </aside>
    </>
  );
}
