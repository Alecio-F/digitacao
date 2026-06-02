import { Card } from '@/components/ui';
import styles from '../RankingPage.module.css';

const FUTURE_FEATURES = [
  'Ranking global',
  'Ranking semanal',
  'Ranking por modo',
  'Ranking de minigames',
  'Perfil público',
];

export function GlobalRankingNotice() {
  return (
    <Card as="section" className={styles.noticePanel} aria-labelledby="global-notice-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Em breve</span>
        <h2 id="global-notice-title" className={styles.panelTitle}>Ranking global em breve</h2>
      </header>

      <p className={styles.noticeText}>
        No momento, este ranking usa apenas os dados salvos neste navegador. Em uma versão futura,
        com conta online, você poderá competir com outros jogadores.
      </p>

      <ul className={styles.futureList}>
        {FUTURE_FEATURES.map((feature) => (
          <li key={feature}>
            <span className={styles.futureDot} aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </Card>
  );
}
