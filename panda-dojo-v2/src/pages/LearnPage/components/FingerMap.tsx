import styles from '../LearnPage.module.css';

const LEFT_HAND = [
  ['Mindinho', 'A'],
  ['Anelar', 'S'],
  ['Médio', 'D'],
  ['Indicador', 'F'],
];

const RIGHT_HAND = [
  ['Indicador', 'J'],
  ['Médio', 'K'],
  ['Anelar', 'L'],
  ['Mindinho', 'Ç'],
];

export function FingerMap() {
  return (
    <div className={styles.fingerMap}>
      <Hand title="Mão esquerda" rows={LEFT_HAND} />
      <Hand title="Mão direita" rows={RIGHT_HAND} />

      <div className={styles.dojoRule}>
        <strong>Regra do dojo</strong>
        <p>
          Depois de cada movimento, volte para <Keycap wide>ASDF</Keycap> e{' '}
          <Keycap wide>JKLÇ</Keycap>. Os polegares ficam no <Keycap space>ESPAÇO</Keycap>.
        </p>
      </div>
    </div>
  );
}

function Hand({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className={styles.handBlock}>
      <h3>{title}</h3>
      <div className={styles.fingerRows}>
        {rows.map(([finger, key]) => (
          <div key={key} className={styles.fingerRow}>
            <span>{finger}</span>
            <Keycap>{key}</Keycap>
          </div>
        ))}
      </div>
    </section>
  );
}

function Keycap({
  children,
  wide = false,
  space = false,
}: {
  children: string;
  wide?: boolean;
  space?: boolean;
}) {
  return (
    <kbd className={[styles.keycap, wide ? styles.keycapWide : '', space ? styles.keycapSpace : '']
      .filter(Boolean)
      .join(' ')}
    >
      {children}
    </kbd>
  );
}
