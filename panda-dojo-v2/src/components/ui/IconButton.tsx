import type { ButtonHTMLAttributes } from 'react';
import styles from './IconButton.module.css';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
  active?: boolean;
}

export function IconButton({ icon, label, active, className = '', ...rest }: IconButtonProps) {
  const cls = [styles.btn, active ? styles.active : '', className].filter(Boolean).join(' ');
  return (
    <button className={cls} aria-label={label} {...rest}>
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
