import { NavLink } from 'react-router';
import styles from './MobileBottomNav.module.css';

const ITEMS = [
  { label: 'Início', icon: 'home', to: '/' },
  { label: 'Arena', icon: 'keyboard', to: '/arena' },
  { label: 'Mapa', icon: 'map', to: '/mapa' },
  { label: 'Arcade', icon: 'stadia_controller', to: '/arcade' },
  { label: 'Conta', icon: 'person', to: '/conta' },
];

export function MobileBottomNav() {
  return (
    <nav className={styles.nav} aria-label="Menu mobile">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
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
      ))}
    </nav>
  );
}
