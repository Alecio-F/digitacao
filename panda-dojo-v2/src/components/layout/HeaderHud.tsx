import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';
import { IconButton } from '@/components/ui';
import { PlayerStatus } from '@/features/gamification/components/PlayerStatus';
import styles from './HeaderHud.module.css';

const NAV_ITEMS = [
  { label: 'Início', to: '/' },
  { label: 'Arena', to: '/arena' },
  { label: 'Aprenda', to: '/aprenda' },
  { label: 'Mapa', to: '/mapa' },
  { label: 'Arcade', to: '/arcade' },
  { label: 'Ranking', to: '/ranking' },
];

interface Props {
  onSettingsOpen: () => void;
  isSettingsOpen?: boolean;
}

export function HeaderHud({ onSettingsOpen, isSettingsOpen = false }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={[
        styles.header,
        scrolled ? styles.scrolled : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.hud}>
        <Link className={styles.brand} to="/" aria-label="PandaDigitações, página inicial">
          <span className={styles.brandMark}>
            <img src="/logo.png" alt="" width="50" height="60" />
          </span>
          <span className={styles.brandText}>
            <strong className={styles.brandName}>PandaDigitações</strong>
            <small className={styles.brandSubtitle}>DOJO ARCADE</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Menu principal">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [
                      styles.navKey,
                      isActive ? styles.navKeyActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <PlayerStatus />

          <Link className={styles.trainButton} to="/arena">
            Começar treino
          </Link>

          <NavLink
            className={({ isActive }) =>
              [styles.loginLink, isActive ? styles.loginLinkActive : ''].filter(Boolean).join(' ')
            }
            to="/conta"
          >
            Entrar
          </NavLink>

          <IconButton
            icon="settings"
            label="Abrir configurações"
            active={isSettingsOpen}
            className={styles.settingsButton}
            onClick={onSettingsOpen}
          />
        </div>
      </div>
    </header>
  );
}
