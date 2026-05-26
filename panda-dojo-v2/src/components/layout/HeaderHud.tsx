import { useEffect, useState } from 'react';
import { IconButton, Button } from '@/components/ui';
import { KEYS, XP_PER_LEVEL } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import styles from './HeaderHud.module.css';

const NAV_ITEMS = [
  { label: 'Início', href: '#' },
  { label: 'Arena', href: '#' },
  { label: 'Aprenda', href: '#' },
  { label: 'Mapa', href: '#' },
  { label: 'Arcade', href: '#' },
];

interface Props {
  onSettingsOpen: () => void;
}

export function HeaderHud({ onSettingsOpen }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

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

  const xpPercent = Math.min(100, Math.round(((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100));

  return (
    <header className={[styles.header, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <a className={styles.brand} href="#" aria-label="PandaDigitações, página inicial">
          <span className={styles.brandLogo} aria-hidden="true">🐼</span>
          <span>
            <span className={styles.brandText}>PandaDigitações</span>
            <small className={styles.brandSub}>Dojo Arcade</small>
          </span>
        </a>

        <nav className={styles.nav} aria-label="Navegação principal">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a href={item.href} className={styles.navLink}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <div className={styles.playerStatus} aria-label="Status do jogador">
            <span className={styles.playerLevel}>Nível {level}</span>
            <strong className={styles.playerXp}>{xp} XP</strong>
            <div className={styles.xpBar} aria-hidden="true">
              <i className={styles.xpFill} style={{ width: `${xpPercent}%` }} />
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => {}}>
            Treinar
          </Button>

          <IconButton icon="settings" label="Configurações" onClick={onSettingsOpen} />
        </div>
      </div>
    </header>
  );
}
