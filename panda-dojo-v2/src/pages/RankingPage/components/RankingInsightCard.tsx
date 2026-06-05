import styles from '../RankingPage.module.css';

interface Props {
  insight: string;
}

export function RankingInsightCard({ insight }: Props) {
  return (
    <section className={styles.insightCard} aria-labelledby="ranking-insight-title">
      <div className={styles.insightIcon} aria-hidden="true">MP</div>
      <div>
        <span className={styles.eyebrow}>Dica do Mestre Panda</span>
        <h2 id="ranking-insight-title">Leitura do mural</h2>
        <p>{insight}</p>
      </div>
    </section>
  );
}
