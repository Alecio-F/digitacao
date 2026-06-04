import { useEffect, useId, useRef, useState } from 'react';
import styles from './ArenaShortcutsHint.module.css';

type ArenaShortcutsHintVariant = 'chip' | 'inline' | 'result';

interface ArenaShortcutsHintProps {
  variant?: ArenaShortcutsHintVariant;
  className?: string;
}

const SHORTCUTS = [
  { keys: ['Tab', 'R'], action: 'Reiniciar' },
  { keys: ['Tab', 'P'], action: 'Pausar / continuar' },
  { keys: ['Tab', 'Enter'], action: 'Próxima ação' },
  { keys: ['Tab', 'M'], action: 'Ir para o Mapa' },
  { keys: ['Tab', 'A'], action: 'Focar Arena' },
];

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <span className={styles.keys} aria-label={keys.join(' mais ')}>
      {keys.map((key, index) => (
        <span key={key} className={styles.keyGroup}>
          {index > 0 && <span className={styles.keyPlus}>+</span>}
          <kbd>{key}</kbd>
        </span>
      ))}
    </span>
  );
}

export function ArenaShortcutsHint({
  variant = 'chip',
  className,
}: ArenaShortcutsHintProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event: PointerEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) return;
      if (!root.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (variant === 'inline') {
    return (
      <p className={joinClassNames(styles.inlineHint, className)}>
        <strong>Atalhos:</strong> <kbd>Tab + R</kbd> reinicia <span>·</span>{' '}
        <kbd>Tab + P</kbd> pausa <span>·</span> <kbd>Tab + Enter</kbd> avança
      </p>
    );
  }

  if (variant === 'result') {
    return (
      <p className={joinClassNames(styles.resultHint, className)}>
        <strong>Atalhos:</strong> <kbd>Tab + R</kbd> tentar novamente <span>·</span>{' '}
        <kbd>Tab + Enter</kbd> próxima ação <span>·</span> <kbd>Tab + M</kbd> mapa
      </p>
    );
  }

  return (
    <div
      ref={rootRef}
      className={joinClassNames(styles.shortcutRoot, className)}
      onBlur={(event) => {
        const nextTarget = event.relatedTarget;
        if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={styles.chipButton}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={popoverId}
        data-open={open ? 'true' : undefined}
        onClick={() => setOpen((current) => !current)}
        onFocus={() => setOpen(true)}
      >
        <span className={`material-symbols-outlined ${styles.chipIcon}`} aria-hidden="true">
          keyboard
        </span>
        Atalhos
      </button>

      {open && (
        <div id={popoverId} className={styles.popover} role="tooltip">
          <strong className={styles.popoverTitle}>Atalhos da Arena</strong>
          <dl className={styles.shortcutList}>
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.action} className={styles.shortcutRow}>
                <dt>
                  <ShortcutKeys keys={shortcut.keys} />
                </dt>
                <dd>{shortcut.action}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
