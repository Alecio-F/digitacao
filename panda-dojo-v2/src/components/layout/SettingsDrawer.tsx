import { useEffect, useId } from 'react';
import { useSettingsContext } from '@/app/settingsContext';
import type { Theme } from '@/features/settings/types';
import styles from './SettingsDrawer.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRACTICE_TIME_OPTIONS = [
  { value: 0.25, label: '15 segundos' },
  { value: 0.5, label: '30 segundos' },
  { value: 1, label: '1 minuto' },
  { value: 2, label: '2 minutos' },
  { value: 5, label: '5 minutos' },
  { value: 10, label: '10 minutos' },
  { value: 15, label: '15 minutos' },
];

function SwitchControl({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={[styles.switchButton, checked ? styles.switchButtonOn : '']
        .filter(Boolean)
        .join(' ')}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.switchKnob} aria-hidden="true" />
    </button>
  );
}

export function SettingsDrawer({ open, onClose }: Props) {
  const titleId = useId();
  const {
    settings,
    setTheme,
    setDefaultPracticeTime,
    setSoundsEnabled,
    setAnimationsEnabled,
    setReducedEffects,
    setCursorMode,
    setKeyboardVisible,
  } = useSettingsContext();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const drawerClassName = [styles.drawer, open ? styles.drawerOpen : '']
    .filter(Boolean)
    .join(' ');

  const backdropClassName = [styles.backdrop, open ? styles.backdropOpen : '']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <button
        type="button"
        className={backdropClassName}
        aria-label="Fechar configurações pelo fundo"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />

      <aside
        className={drawerClassName}
        aria-labelledby={titleId}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerKicker}>Dojo Arcade</span>
            <h2 id={titleId} className={styles.drawerTitle}>
              Configurações
            </h2>
            <p className={styles.drawerSubtitle}>
              Preferências locais salvas no navegador.
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            aria-label="Fechar configurações"
            onClick={onClose}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <div className={styles.drawerBody}>
          <section className={styles.section} aria-labelledby="settings-appearance">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Aparência</span>
              <h3 id="settings-appearance">Tema do Dojo</h3>
            </div>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Tema claro/escuro</strong>
                <span>Alterna o visual geral sem quebrar o tema atual.</span>
              </div>
              <div className={styles.segmented} role="group" aria-label="Tema do site">
                {(['dark', 'light'] as Theme[]).map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={[
                      styles.segmentedButton,
                      settings.theme === theme ? styles.segmentedButtonActive : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-pressed={settings.theme === theme}
                    onClick={() => setTheme(theme)}
                  >
                    {theme === 'dark' ? 'Escuro' : 'Claro'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="settings-practice">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Treino</span>
              <h3 id="settings-practice">Type Arena</h3>
            </div>

            <label className={styles.option}>
              <div className={styles.optionText}>
                <strong>Tempo padrão</strong>
                <span>Preferência salva em tempoPratica para uso futuro dos treinos.</span>
              </div>
              <select
                className={styles.select}
                value={settings.defaultPracticeTime}
                onChange={(event) => setDefaultPracticeTime(Number(event.target.value))}
              >
                {PRACTICE_TIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Cursor da arena</strong>
                <span>Escolha pelo visual do cursor enquanto digita.</span>
              </div>
              <div className={styles.cursorChoices} role="group" aria-label="Cursor da Type Arena">
                <button
                  type="button"
                  className={[
                    styles.cursorChoice,
                    styles.cursorChoiceUnderline,
                    settings.cursorMode === 'arcade' ? styles.cursorChoiceActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={settings.cursorMode === 'arcade'}
                  onClick={() => setCursorMode('arcade')}
                >
                  <span className={styles.cursorPreviewWord}>Panda</span>
                  <span className={styles.cursorPreviewLabel}>Linha</span>
                </button>
                <button
                  type="button"
                  className={[
                    styles.cursorChoice,
                    styles.cursorChoiceBar,
                    settings.cursorMode === 'classic' ? styles.cursorChoiceActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-pressed={settings.cursorMode === 'classic'}
                  onClick={() => setCursorMode('classic')}
                >
                  <span className={styles.cursorPreviewWord}>Panda</span>
                  <span className={styles.cursorPreviewLabel}>Haste</span>
                </button>
              </div>
            </div>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Teclado virtual</strong>
                <span>Mostra ou oculta o deck visual abaixo do texto da Arena.</span>
              </div>
              <SwitchControl
                checked={settings.keyboardVisible}
                label="Mostrar teclado virtual na Type Arena"
                onChange={setKeyboardVisible}
              />
            </div>
          </section>

          <section className={styles.section} aria-labelledby="settings-experience">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionKicker}>Experiência</span>
              <h3 id="settings-experience">Feedback visual e som</h3>
            </div>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Sons do jogo</strong>
                <span>Efeitos sonoros em minigames e interações arcade.</span>
              </div>
              <SwitchControl
                checked={settings.soundsEnabled}
                label="Ativar sons do jogo"
                onChange={setSoundsEnabled}
              />
            </div>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Animações</strong>
                <span>Controla transições e microinterações da interface.</span>
              </div>
              <SwitchControl
                checked={settings.animationsEnabled}
                label="Ativar animações"
                onChange={setAnimationsEnabled}
              />
            </div>

            <div className={styles.option}>
              <div className={styles.optionText}>
                <strong>Reduzir efeitos</strong>
                <span>Reduz movimentos intensos e efeitos visuais persistentes.</span>
              </div>
              <SwitchControl
                checked={settings.reducedEffects}
                label="Reduzir efeitos visuais"
                onChange={setReducedEffects}
              />
            </div>
          </section>
        </div>

        <footer className={styles.drawerFooter}>
          <span>PandaDigitações · Dojo Arcade v2</span>
        </footer>
      </aside>
    </>
  );
}
