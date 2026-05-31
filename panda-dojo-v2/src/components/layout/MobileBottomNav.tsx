import { NavLink } from 'react-router';
import styles from './MobileBottomNav.module.css';

const ITEMS = [
  { label: 'Início', icon: 'home', to: '/' as string | null },
  { label: 'Arena', icon: 'keyboard', to: '/arena' as string | null },
  { label: 'Mapa', icon: 'map', to: '/mapa' as string | null },
  { label: 'Arcade', icon: 'stadia_controller', to: '/arcade' as string | null },
  { label: 'Conta', icon: 'person', to: '/conta' as string | null },
];

export function MobileBottomNav() {
  return (
    <nav className={styles.nav} aria-label="Navegação mobile">
      {ITEMS.map((item) =>
        item.to ? (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              [styles.item, isActive ? styles.active : ''].filter(Boolean).join(' ')
            }
          >
            <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
              {item.icon}
            </span>
            <strong>{item.label}</strong>
          </NavLink>
        ) : (
          <a key={item.label} className={styles.item} aria-disabled="true">
            <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
              {item.icon}
            </span>
            <strong>{item.label}</strong>
          </a>
        )
      )}
    </nav>
  );
}
