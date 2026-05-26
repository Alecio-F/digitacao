import styles from './FingerPositionMap.module.css';

const LEFT_HAND = [
  { finger: 'Mindinho',   key: 'A' },
  { finger: 'Anelar',     key: 'S' },
  { finger: 'Médio',      key: 'D' },
  { finger: 'Indicador',  key: 'F' },
];

const RIGHT_HAND = [
  { finger: 'Indicador',  key: 'J' },
  { finger: 'Médio',      key: 'K' },
  { finger: 'Anelar',     key: 'L' },
  { finger: 'Mindinho',   key: 'Ç' },
];

export function FingerPositionMap() {
  return (
    <div className={styles.map}>
      <HandCard title="Mão esquerda" rows={LEFT_HAND} />
      <HandCard title="Mão direita"  rows={RIGHT_HAND} />

      <div className={styles.ruleBox}>
        <strong>Regra do dojo</strong>
        <p>
          Depois de cada movimento, volte para{' '}
          <kbd className={styles.keycap}>ASDF</kbd> e <kbd className={styles.keycap}>JKLÇ</kbd>.
          Os polegares ficam no <kbd className={`${styles.keycap} ${styles.space}`}>ESPAÇO</kbd>.
        </p>
      </div>
    </div>
  );
}

function HandCard({ title, rows }: { title: string; rows: { finger: string; key: string }[] }) {
  return (
    <section className={styles.handCard}>
      <h3 className={styles.handTitle}>{title}</h3>
      <div className={styles.keyList}>
        {rows.map(({ finger, key }) => (
          <div key={key} className={styles.keyRow}>
            <span>{finger}</span>
            <kbd className={styles.keycap}>{key}</kbd>
          </div>
        ))}
      </div>
    </section>
  );
}
