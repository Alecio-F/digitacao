import styles from './Panels.module.css';

interface Props {
  bestPpm: number;
}

export function RankingPanel({ bestPpm }: Props) {
  const rows = [
    { pos: '01', name: 'Seu recorde', score: bestPpm ? `${bestPpm} PPM` : 'Sem registro', isPlayer: true },
    { pos: '02', name: 'Slot local',  score: 'Aguardando treino', isPlayer: false },
    { pos: '03', name: 'Slot local',  score: 'Aguardando treino', isPlayer: false },
  ];

  return (
    <section className={styles.panel} aria-labelledby="ranking-title">
      <h2 className={styles.panelTitle} id="ranking-title">Ranking local</h2>
      <ol className={styles.rankingList}>
        {rows.map((row) => (
          <li key={row.pos} className={[styles.rankingItem, row.isPlayer ? styles.rankingPlayer : ''].filter(Boolean).join(' ')}>
            <span className={styles.rankPos}>{row.pos}</span>
            <strong>{row.name}</strong>
            <em>{row.score}</em>
          </li>
        ))}
      </ol>
    </section>
  );
}
