import { Link } from 'react-router';
import { Button } from '@/components/ui';
import { KEYS } from '@/constants';
import { getStorage } from '@/services/storage/storageService';
import type { HistoryItem } from '@/features/gamification/types';
import { getResultRecommendation } from '@/features/typing/utils/saveResult';
import styles from './ResultsScreen.module.css';

interface ResultsScreenProps {
  ppm: number;
  cpm: number;
  precision: number;
  errors: number;
  maxCombo: number;
  gainedXp: number;
  level: number;
  title: string;
  isRecord: boolean;
  topErrors: [string, number][];
  onRestart: () => void;
}

export function ResultsScreen({
  ppm,
  cpm,
  precision,
  errors,
  maxCombo,
  gainedXp,
  level,
  title,
  isRecord,
  topErrors,
  onRestart,
}: ResultsScreenProps) {
  const recommendation = getResultRecommendation(precision, ppm, topErrors);
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  const bestPpm = history.reduce((b, r) => Math.max(b, Number(r.ppm) || 0), 0);

  return (
    <div className={styles.screen}>
      <header className={styles.header}>
        <span className={styles.eyebrow}>Treino concluído</span>
        <h2 className={styles.heading}>
          {isRecord ? 'Novo recorde pessoal!' : 'Resultado do treino'}
        </h2>
        {isRecord && (
          <span className={styles.recordBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
              emoji_events
            </span>
            Recorde do Dojo
          </span>
        )}
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={[styles.statValue, styles.statValueHighlight].join(' ')}>{ppm}</span>
          <span className={styles.statLabel}>PPM</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{cpm}</span>
          <span className={styles.statLabel}>CPM</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{precision}%</span>
          <span className={styles.statLabel}>Precisão</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{errors}</span>
          <span className={styles.statLabel}>Erros</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{maxCombo}x</span>
          <span className={styles.statLabel}>Combo</span>
        </div>
      </div>

      <div className={styles.xpRow}>
        <span className={styles.xpGained}>+{gainedXp} XP</span>
        <span className={styles.levelInfo}>
          Nível {level} · {title}
        </span>
      </div>

      {topErrors.length > 0 && (
        <div className={styles.topErrors}>
          <strong>Teclas mais erradas:</strong>
          {topErrors.map(([char, count]) => (
            <span key={char} className={styles.errorKey}>
              {char === ' ' ? '␣' : char.toUpperCase()}
              <small>{count}×</small>
            </span>
          ))}
        </div>
      )}

      <div className={styles.recBox}>
        <span>{recommendation.text}</span>
        {recommendation.href && recommendation.linkText && (
          <Link to={recommendation.href} className={styles.recLink}>
            {recommendation.linkText} →
          </Link>
        )}
      </div>

      <div className={styles.actions}>
        <Button variant="primary" onClick={onRestart}>
          Treinar novamente
        </Button>
        <Link to="/" className={styles.recLink} style={{ alignSelf: 'center' }}>
          ← Ir para Home
        </Link>
      </div>

      {history.length > 0 && (
        <section className={styles.historySection}>
          <h3 className={styles.historyTitle}>Histórico recente</h3>
          <div className={styles.historyList}>
            {history.slice(0, 5).map((item, i) => {
              const itemPpm = Number(item.ppm) || 0;
              const isItemRecord = itemPpm > 0 && itemPpm === bestPpm;
              return (
                <div
                  key={i}
                  className={[
                    styles.historyItem,
                    isItemRecord ? styles.historyItemRecord : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.historyPpm}>{itemPpm} PPM</span>
                  <div className={styles.historyMeta}>
                    <span>{item.precisao}</span>
                    <span>{item.cpm} CPM</span>
                    <span>{item.erros} erros</span>
                    <span>{item.data}</span>
                  </div>
                  {(i === 0 || isItemRecord) && (
                    <span className={styles.historyBadge}>
                      {i === 0 ? 'Atual' : 'Recorde'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
