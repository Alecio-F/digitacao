import { Link } from 'react-router';
import { KEYS } from '@/constants';
import type { HistoryItem } from '@/features/gamification/types';
import type { LessonMedal } from '@/features/lessons/types';
import { getResultRecommendation } from '@/features/typing/utils/saveResult';
import { getStorage } from '@/services/storage/storageService';
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
  duration: string;
  lessonCompleted: boolean;
  lessonCompletedNow: boolean;
  lessonMedal: LessonMedal | null;
  nextLessonTitle: string | null;
  nextActionLabel?: string;
  onRestart: () => void;
  onNext: () => void;
}

function getAchievement(precision: number, ppm: number) {
  if (precision >= 98 && ppm >= 50) return { label: 'Precisão · Ouro', tier: 'gold' as const };
  if (precision >= 95 && ppm >= 30) return { label: 'Precisão · Prata', tier: 'silver' as const };
  if (precision >= 85) return { label: 'Precisão · Bronze', tier: 'bronze' as const };
  return null;
}

function formatErrorKey(char: string) {
  return char === ' ' ? 'ESPAÇO' : char.toUpperCase();
}

const MEDAL_LABEL: Record<LessonMedal, string> = {
  none: 'Sem medalha',
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
};

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
  duration,
  lessonCompleted,
  lessonCompletedNow,
  lessonMedal,
  nextLessonTitle,
  nextActionLabel,
  onRestart,
  onNext,
}: ResultsScreenProps) {
  const recommendation = getResultRecommendation(precision, ppm, topErrors);
  const history = getStorage<HistoryItem[]>(KEYS.historico, []);
  const bestPpm = history.reduce((best, result) => Math.max(best, Number(result.ppm) || 0), 0);
  const achievement = getAchievement(precision, ppm);

  const metrics = [
    { label: 'TEMPO', value: duration },
    { label: 'PPM', value: String(ppm) },
    { label: 'CPM', value: String(cpm) },
    { label: 'PRECISÃO', value: `${precision}%` },
    { label: 'ERROS', value: String(errors) },
    { label: 'COMBO MÁX.', value: `${maxCombo}x` },
  ];

  return (
    <div className={styles.screen}>
      <div className={styles.levelHeader}>
        <div className={styles.levelInfo}>
          <span className={styles.levelEyebrow}>Resultado da rodada</span>
          <span className={styles.levelTitle}>
            Nível {level} · {title}
          </span>
        </div>
        <span className={styles.xpBadge}>+{gainedXp} XP</span>
      </div>

      {(achievement || isRecord) && (
        <div
          className={[
            styles.achievementBanner,
            achievement ? styles[`tier_${achievement.tier}`] : styles.tier_record,
          ].join(' ')}
        >
          <span className={`material-symbols-outlined ${styles.achieveIcon}`}>
            emoji_events
          </span>
          <span className={styles.achieveLabel}>
            {achievement ? achievement.label : 'Novo recorde pessoal!'}
          </span>
          {isRecord && achievement && <span className={styles.recordTag}>Novo recorde!</span>}
        </div>
      )}

      {lessonCompleted && (
        <div className={styles.lessonBanner}>
          <span className="material-symbols-outlined">verified</span>
          <div>
            <strong>{lessonCompletedNow ? 'Fase concluída' : 'Fase já concluída'}</strong>
            <span>
              {lessonMedal && lessonMedal !== 'none'
                ? `Medalha ${MEDAL_LABEL[lessonMedal]}`
                : 'Meta de 85% alcançada'}
            </span>
          </div>
        </div>
      )}

      <section>
        <h3 className={styles.sectionTitle}>Desempenho</h3>
        <div className={styles.metricsGrid}>
          {metrics.map(({ label, value }) => (
            <div key={label} className={styles.metricCard}>
              <span className={styles.metricLabel}>{label}</span>
              <strong className={styles.metricValue}>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {topErrors.length > 0 ? (
        <div className={styles.errorsRow}>
          <span className={styles.errorsLabel}>Teclas para revisar</span>
          <div className={styles.errorKeys}>
            {[...topErrors]
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([char, count]) => (
                <span key={char} className={styles.errorKey}>
                  {formatErrorKey(char)}
                  <small>{count}x</small>
                </span>
              ))}
          </div>
        </div>
      ) : (
        <div className={styles.noErrorsRow}>
          <span className="material-symbols-outlined" aria-hidden="true">task_alt</span>
          Nenhuma tecla errada nesta rodada.
        </div>
      )}

      <div className={styles.recCard}>
        <div className={styles.recIconWrap}>
          <span className="material-symbols-outlined">lightbulb</span>
        </div>
        <div className={styles.recContent}>
          <span className={styles.recTitle}>Recomendação do Mestre Panda</span>
          <p className={styles.recText}>{recommendation.text}</p>
        </div>
        {recommendation.href && recommendation.linkText && (
          <Link to={recommendation.href} className={styles.recBtn}>
            {recommendation.linkText}
          </Link>
        )}
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={onRestart}>
          Tentar novamente
        </button>
        <button className={styles.btnPrimary} onClick={onNext}>
          {nextActionLabel ?? (nextLessonTitle ? 'Próxima fase' : 'Próximo texto')}
        </button>
      </div>

      {nextLessonTitle && (
        <p className={styles.nextHint}>Próxima fase: {nextLessonTitle}</p>
      )}

      {history.length > 0 && (
        <section className={styles.historySection}>
          <h3 className={styles.historyTitle}>Últimos resultados</h3>
          <div className={styles.historyScroll}>
            {history.slice(0, 10).map((item, index) => {
              const itemPpm = Number(item.ppm) || 0;
              const isItemRecord = itemPpm > 0 && itemPpm === bestPpm;
              const isFirst = index === 0;

              return (
                <div
                  key={`${item.data ?? 'resultado'}-${index}`}
                  className={[
                    styles.historyCard,
                    isFirst ? styles.historyCardCurrent : '',
                    isItemRecord ? styles.historyCardRecord : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.historyCardTop}>
                    <span className={styles.historyDate}>{item.data ?? '-'}</span>
                    {isFirst && <span className={styles.historyBadgeCurrent}>Atual</span>}
                    {isItemRecord && <span className={styles.historyBadgeRecord}>Recorde</span>}
                  </div>
                  <div className={styles.historyPpmRow}>
                    <strong className={styles.historyPpm}>{itemPpm}</strong>
                    <span className={styles.historyPpmUnit}>PPM</span>
                  </div>
                  <div className={styles.historyMeta}>
                    <span>{item.precisao}</span>
                    {item.cpm != null && <span>{item.cpm} CPM</span>}
                    {item.erros != null && <span>{item.erros} erros</span>}
                    {item.tempo != null && (
                      <span>
                        {item.tempo < 1
                          ? `${Math.round(item.tempo * 60)}s`
                          : `${item.tempo}min`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
