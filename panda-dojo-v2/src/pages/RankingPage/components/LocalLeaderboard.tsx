import { Link } from 'react-router';
import { Card } from '@/components/ui';
import { getLessonById } from '@/features/lessons/data/lessons';
import type { LocalRanking, RankingResult } from '@/features/ranking/hooks/useLocalRanking';
import styles from '../RankingPage.module.css';

interface Props {
  ranking: LocalRanking;
}

function modeLabel(item: RankingResult): string {
  if (!item.lessonId) return 'Treino livre';
  return getLessonById(item.lessonId)?.title ?? 'Treino';
}

export function LocalLeaderboard({ ranking }: Props) {
  const { topResults } = ranking;

  return (
    <Card as="section" className={styles.panel} aria-labelledby="leaderboard-title">
      <header className={styles.panelHeader}>
        <span className={styles.eyebrow}>Placar local</span>
        <h2 id="leaderboard-title" className={styles.panelTitle}>Melhores resultados</h2>
      </header>

      {topResults.length === 0 ? (
        <>
          <p className={styles.emptyText}>
            Complete um treino na Arena para aparecer no ranking local.
          </p>
          <Link className={styles.ctaSecondary} to="/arena">
            Ir para Arena
          </Link>
        </>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.leaderboard}>
            <caption className={styles.srOnly}>
              Dez melhores treinos locais ordenados por PPM
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.colRank}>#</th>
                <th scope="col">Modo</th>
                <th scope="col" className={styles.colNum}>PPM</th>
                <th scope="col" className={`${styles.colNum} ${styles.colHideSm}`}>CPM</th>
                <th scope="col" className={styles.colNum}>Precisão</th>
                <th scope="col" className={`${styles.colNum} ${styles.colHideSm}`}>Erros</th>
                <th scope="col" className={`${styles.colNum} ${styles.colHideSm}`}>Combo</th>
                <th scope="col" className={styles.colHideMd}>Data</th>
              </tr>
            </thead>
            <tbody>
              {topResults.map((item, index) => (
                <tr key={`${item.data ?? 'treino'}-${index}`}>
                  <td className={styles.colRank}>
                    <span className={[styles.rankBadge, index < 3 ? styles.rankTop : '']
                      .filter(Boolean)
                      .join(' ')}>
                      {index + 1}
                    </span>
                  </td>
                  <td>{modeLabel(item)}</td>
                  <td className={`${styles.colNum} ${styles.strongNum}`}>{item.ppm ?? '--'}</td>
                  <td className={`${styles.colNum} ${styles.colHideSm}`}>{item.cpm ?? '--'}</td>
                  <td className={styles.colNum}>{item.precisao ?? '--'}</td>
                  <td className={`${styles.colNum} ${styles.colHideSm}`}>{item.erros ?? 0}</td>
                  <td className={`${styles.colNum} ${styles.colHideSm}`}>
                    {item.combo ? `${item.combo}x` : '--'}
                  </td>
                  <td className={styles.colHideMd}>{item.data ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
