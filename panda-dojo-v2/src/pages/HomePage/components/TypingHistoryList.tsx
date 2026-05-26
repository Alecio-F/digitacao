import type { HistoryItem } from '@/features/gamification/types';
import styles from './Panels.module.css';

interface Props {
  history: HistoryItem[];
}

export function TypingHistoryList({ history }: Props) {
  return (
    <section className={styles.panel} aria-label="Histórico de treinos">
      <h2 className={styles.panelTitle}>Histórico recente</h2>
      {history.length === 0 ? (
        <p className={styles.empty}>Você ainda não iniciou sua jornada. Faça seu primeiro treino.</p>
      ) : (
        <ul className={styles.historyList}>
          {history.slice(0, 4).map((item, i) => (
            <li key={i} className={styles.historyItem}>
              <strong>{Number(item.ppm) || 0} PPM</strong>
              <span>{item.precisao || '0%'} de precisão</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
