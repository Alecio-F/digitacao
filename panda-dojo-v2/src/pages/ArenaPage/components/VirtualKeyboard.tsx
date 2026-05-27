import styles from './VirtualKeyboard.module.css';

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

interface VirtualKeyboardProps {
  activeKey: string;
}

export function VirtualKeyboard({ activeKey }: VirtualKeyboardProps) {
  const active = activeKey.toLowerCase();

  return (
    <div className={styles.kb} aria-hidden="true">
      {ROWS.map((row, ri) => (
        <div key={ri} className={styles.row}>
          {row.map((k) => (
            <span
              key={k}
              className={[styles.key, active === k ? styles.keyActive : ''].filter(Boolean).join(' ')}
            >
              {k.toUpperCase()}
            </span>
          ))}
        </div>
      ))}
      <div className={styles.row}>
        <span className={[styles.key, styles.keyXwide, active === ' ' ? styles.keyActive : ''].filter(Boolean).join(' ')}>
          ESPAÇO
        </span>
      </div>
    </div>
  );
}
