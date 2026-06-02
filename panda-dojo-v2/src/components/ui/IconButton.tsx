import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';

export type IconButtonVariant = 'ghost' | 'surface' | 'primary';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  active?: boolean;
}

function renderIcon(icon: ReactNode) {
  if (typeof icon === 'string') {
    return (
      <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
        {icon}
      </span>
    );
  }

  return <span className={styles.customIcon} aria-hidden="true">{icon}</span>;
}

export function IconButton({
  icon,
  label,
  variant = 'surface',
  size = 'md',
  active = false,
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    active ? styles.active : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} type={type} aria-label={label} {...rest}>
      {renderIcon(icon)}
    </button>
  );
}
