import { useEffect } from 'react';
import { useSettingsContext } from '@/app/providers';
import { IconButton } from '@/components/ui';
import styles from './SettingsDrawer.module.css';

const PRACTICE_OPTIONS = [
  { value: 0.25, label: '15 seg' },
  { value: 0.5,  label: '30 seg' },
  { value: 1,    label: '1 min' },
  { value: 2,    label: '2 min' },
  { value: 3,    label: '3 min' },
  { value: 5,    label: '5 min' },
  { value: 10,   label: '10 min' },
  { value: 15,   label: '15 min' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsDrawer({ open, onClose }: Props) {
  const { settings, toggleTheme, setPracticeTime, setSounds, setAnimations, setReducedEffects } =
    useSettingsContext();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      <div
        className={[styles.backdrop, open ? styles.open : ''].filter(Boolean).join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={[styles.drawer, open ? styles.open : ''].filter(Boolean).join(' ')}
        aria-label="Configurações do Dojo"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerKicker}>Configurações</span>
            <h2 className={styles.drawerTitle}>Preferências do treino</h2>
          </div>
          <IconButton icon="close" label="Fechar configurações" onClick={onClose} />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <strong>Tema claro/escuro</strong>
            <span>Alterna a aparência do Dojo.</span>
          </div>
          <button className={styles.themeToggle} onClick={toggleTheme} aria-label="Alternar tema">
            <span className="material-symbols-outlined" aria-hidden="true">
              {settings.theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>

        <div className={styles.row}>
          <label htmlFor="practiceTime" className={styles.rowLabel}>
            <strong>Tempo de prática</strong>
            <span>Duração padrão da Type Arena.</span>
          </label>
          <select
            id="practiceTime"
            className={styles.select}
            value={settings.practiceTime}
            onChange={(e) => setPracticeTime(parseFloat(e.target.value))}
          >
            {PRACTICE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <strong>Sons do jogo</strong>
            <span>Preparado para os minigames.</span>
          </div>
          <input
            type="checkbox"
            className={styles.switch}
            aria-label="Ativar sons"
            checked={settings.sounds}
            onChange={(e) => setSounds(e.target.checked)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <strong>Animações</strong>
            <span>Transições leves da interface.</span>
          </div>
          <input
            type="checkbox"
            className={styles.switch}
            aria-label="Ativar animações"
            checked={settings.animations}
            onChange={(e) => setAnimations(e.target.checked)}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.rowLabel}>
            <strong>Reduzir efeitos visuais</strong>
            <span>Use junto da preferência do sistema.</span>
          </div>
          <input
            type="checkbox"
            className={styles.switch}
            aria-label="Reduzir efeitos"
            checked={settings.reducedEffects}
            onChange={(e) => setReducedEffects(e.target.checked)}
          />
        </div>
      </aside>
    </>
  );
}
