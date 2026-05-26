import styles from './MobileBottomNav.module.css';

const ITEMS = [
  { label: 'Início', icon: 'home', href: '#' },
  { label: 'Arena', icon: 'keyboard', href: '#' },
  { label: 'Mapa', icon: 'map', href: '#' },
  { label: 'Arcade', icon: 'stadia_controller', href: '#' },
  { label: 'Conta', icon: 'person', href: '#' },
];

interface Props {
  activePage?: string;
}

export function MobileBottomNav({ activePage }: Props) {
  return (
    <nav className={styles.nav} aria-label="Navegação mobile">
      {ITEMS.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className={[styles.item, activePage === item.label ? styles.active : ''].filter(Boolean).join(' ')}
          aria-current={activePage === item.label ? 'page' : undefined}
        >
          <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
            {item.icon}
          </span>
          <strong>{item.label}</strong>
        </a>
      ))}
    </nav>
  );
}
