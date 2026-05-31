import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { KEYS, XP_PER_LEVEL } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import styles from './HeaderHud.module.css';

const NAV_ITEMS = [
  { label: 'Início',  to: '/' },
  { label: 'Arena',   to: '/arena' },
  { label: 'Aprenda', to: '/aprenda' },
  { label: 'Mapa',    to: '/mapa' },
  { label: 'Arcade',  to: '/arcade' },
];

interface Props {
  onSettingsOpen: () => void;
  isSettingsOpen?: boolean;
}

export function HeaderHud({ onSettingsOpen, isSettingsOpen = false }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const storedXp = Math.max(0, Number(getStorage<string>(KEYS.xp, '0')) || 0);
    const storedLevel = Number(getStorage<string>(KEYS.level, '1')) || 1;
    setXp(storedXp);
    setLevel(storedLevel > 0 ? storedLevel : Math.max(1, Math.floor(storedXp / XP_PER_LEVEL) + 1));
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 18);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const xpInLevel = xp % XP_PER_LEVEL;
  const xpPercent = Math.min(100, Math.round((xpInLevel / XP_PER_LEVEL) * 100));

  return (
    <header className={[styles.header, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
      <div className={styles.inner}>

        <Link className={styles.brand} to="/" aria-label="PandaDigitações, página inicial">
          <img src="/logo.png" alt="PandaDigitações" width="50" height="60" className={styles.brandImg} />
          <span>
            <span className={styles.brandText}>PandaDigitações</span>
            <small className={styles.brandSub}>Dojo Arcade</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    [styles.navLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.playerBadge} aria-label="Status do jogador">
            <div className={styles.badgeRow}>
              <span className={styles.badgeLevel}>Nível {level}</span>
              <span className={styles.badgeSep}>·</span>
              <span className={styles.badgeXp}>{xp} XP</span>
            </div>
            <div className={styles.xpBar} aria-hidden="true">
              <i className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <button className={styles.trainBtn} onClick={() => navigate('/arena')}>
            Começar treino
          </button>

          <button
            className={styles.iconBtn}
            aria-label="Configurações"
            onClick={onSettingsOpen}
          >
            <span
              className={[
                'material-symbols-outlined',
                styles.settingsIcon,
                isSettingsOpen ? styles.settingsIconOpen : '',
              ].filter(Boolean).join(' ')}
            >
              settings
            </span>
          </button>
        </div>

      </div>
    </header>
  );
}
