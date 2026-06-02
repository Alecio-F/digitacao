import { useEffect } from 'react';
import { IconButton } from './IconButton';
import styles from './Toast.module.css';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger' | 'special';

export interface ToastProps {
  open: boolean;
  title: string;
  message?: string;
  tone?: ToastTone;
  onClose?: () => void;
  autoCloseMs?: number;
}

export function Toast({
  open,
  title,
  message,
  tone = 'default',
  onClose,
  autoCloseMs,
}: ToastProps) {
  useEffect(() => {
    if (!open || !autoCloseMs || !onClose) return undefined;
    const timer = window.setTimeout(onClose, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [autoCloseMs, onClose, open]);

  return (
    <div
      className={[styles.toast, styles[tone], open ? styles.open : ''].filter(Boolean).join(' ')}
      role="status"
      aria-live="polite"
      aria-hidden={!open}
    >
      <div className={styles.content}>
        <strong>{title}</strong>
        {message && <span>{message}</span>}
      </div>
      {onClose && (
        <IconButton
          icon="close"
          label="Fechar aviso"
          size="sm"
          variant="ghost"
          className={styles.close}
          onClick={onClose}
        />
      )}
    </div>
  );
}
